//
// INICIALIZAÇÂO
//

// pega o canvas no HTML pelo id
const canvas = document.getElementById('jogoCanvas');
// pega o contexto 2d, usado para desenhar formas
const ctx = canvas.getContext('2d');

//
//VARIÁVEIS GLOBAIS
//

// Indica se o jogo acabou ou não
let gameOver =  false;
//Armazena a pontuação máxima do jogador, recuperada éçp localStorage. caso nao tiver salva 0
let maxPontuacao = localStorage.getItem('maxPontuacao') ? parseInt(localStorage.getItem('maxPontuacao')) : 0;

//
//CLASSE ENTIDADE
//
class Entidade {
    #gravidade
    //inicializa a posição x,y e a altura e largura
    constructor( x, y, largura, altura ) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.#gravidade = 0.4;
    }
    //desenha a entidade no canvas
    desenhar = function( ctx, cor) {
        ctx.fillStyle = cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }

    //Retorna o valor da gravidade 
    getGravidade(){
        return this.#gravidade;
    }
}   
//
// CLASSE PERSONAGEM (HERDADO DA ENTIDADE)
//
class Personagem extends Entidade {
    #velocidadey
    #pulando
    #pontuou
    #pontuacao //armazenA a pontuação
    constructor( x, y, largura, altura) {
        super(x, y, largura, altura);
        this.#velocidadey = 0;
        this.#pulando = false;
        this.#pontuacao = 0;
        this.#pontuou = false;
        this.#pontuacao = 0;
        //carregar a imagem do perssonagem
        this.image = new Image(this.largura, this.altura);
        this.image.src = './static/personagem.png';

    }

    //personagem pula, alterando a velocidade e marcando que está pulando
    saltar = function() {
        this.#velocidadey -= 15;
        this.#pulando = true
    }
    //retorna verdadeiro se o personagem estiver pulando
    isPersonagemPulando = function() {
        return this.#pulando;
    }
    //atualiza a posição y do personagem, aplicando a gravidade e verificando se atingiu o chão
    atualizar = function() {
        if (this.#pulando == true) {
            this.#velocidadey += this.getGravidade();
            this.y += this.#velocidadey;
            if (this.y >= canvas.height -100) {
                this.#velocidadey = 0;
                this.#pulando = false;
                this.#pontuou = false;

                }
            }
        }
        //verifica se teve colisão com o obstaculo
        verificarColisao = function (obstaculo) { 
            if (
                //verifica se o lado esquerdo do personagem entrou em contado com o lado direito do obstaculo
                // Ex: se o personagem estiver à direita do obstaculo não teve colisão
                this.x < obstaculo.x + obstaculo.largura &&
                // verifica se o lado direito persoangem entou em contato com o lado esquerdo do obstaculo 
                this.x + this.largura > obstaculo.x &&
                //se a parte superior do personagem está acima da parte inferior do obstaculo
                //Ex: se a parte superior do persoangem estiver abaixo da parte inferior do obstacul, não teve colisão
                this.y < obstaculo.y + obstaculo.altura &&
                // verifica se a parte inferior do personagem está abaixo da parte superior do obstaculo
                this.y + this.altura > obstaculo.y
            ){
                this.#houveColisao(obstaculo);
            }
        }
        
            // verifica se o perssonagem passou pleo obstaculo sem colidir, marcando pontuação
            verificarPontuacao = function(obstaculo) { 
               //(!this.#pontuou) verifica se ainda não pontuou, para evitar marcar 2 vezes pontuação
               //(this.x > obstaculo.x + obstaculo.largura) verifica se o perssonagem passou completamente pelo obstaculo sem colidir
                if(!this.#pontuou && this.x > obstaculo.x +obstaculo.largura) { 
                    this.#pontuou = true;
                    this.#pontuacao += 1;
            }
    
    }
    // verificar se houve colisão e mostra o game over
    #houveColisao = function(obstaculo) {
        //para o obstaculo
        obstaculo.pararObstaculo();
        //atualiza para garantir que pare
        obstaculo.atualizar();
        //desenha o game over
        ctx.fillStyle ='white';
        ctx.font = "50px spongefont";
        ctx.fillText("Game Over!", ( canvas.width/2) - 100, (canvas.height/2));
        // marca o jogo como encerrado
        gameOver = true;
        //escrita do game over
        ctx.fillStyle = 'black';
        ctx.font = "30px spongefont";
        // verifica se a pontuação atual é maior que a maxima
        if (this.#pontuacao > maxPontuacao){
            //atualiza a nova pontuacao maxima
            localStorage.setItem('maxPontuacao', this.#pontuacao);
            ctx.fillText(`Novo Record! ${this.#pontuacao}`, (canvas.width / 2) -150 , (canvas.height / 2) +40);
        }else {
            //escreve a pontuação atual e o record atual
            ctx.fillText(`Pontuação: ${this.#pontuacao} e record atual: ${maxPontuacao}`, (canvas.width / 2) -150, (canvas.height /2) + 40);
           
        }
    }
    //desenha pontução na tela
    desenhaPontuacao = function() {
        ctx.fillStyle = 'white';
        ctx.font = "20px spongefont";
        ctx.fillText(`Pontuação: ${this.#pontuacao}`, 30, 40);
    }
    //desenha a imagem do  perssonagem no canvas
    desenhar = function () {
        ctx.drawImage(this.image, this.x, this.y, this.largura, this.altura);  
    }
}
//
// CLASSE OBSTACULO (HERDA DE ENTIDADE)
//  
class Obstaculo extends Entidade {
    #velocidadex
    constructor(x, y, largura, altura) {
        super(x, y, largura, altura);
        this.#velocidadex = 4;
        //tempo aleatorio patra gerar o próximo obstaculo
        this.tempoProximoObstaculo = Math.floor(Math.random() * 100) +40;
        // indica seo proximo ostaculo já foi gerado
        this.proximoObstaculo = false;
        this.image = new Image(this.largura, this.altura);
        this.image.src = './static/obstaculo.png';
        
    }
    // retorna a velocidade do obstaculo
    getVelocidadeX = function() {
        return this.#velocidadex;
    }
    //Atualiza a posição do obstáculo, gera novos obstáculos e remove os obstáculos que saíram da tela
    atualizar = function() {
        //move o obstaculo
        this.x -= this.getVelocidadeX();
        //verifica se é hora de gerar um novo obstaculo
        if (this.tempoProximoObstaculo <= 0 && this.proximoObstaculo == false){
            //gera altura aleatoria para o novo obstaculo
            let altura_random = (Math.random()*40) + 90;
            // calcula a posição y do novo obstaculo
            let new_y =canvas.height - altura_random;
            //adiciona um novo obstaculo no array de obstaculos
            obstaculos.push(new Obstaculo(canvas.width - 100, new_y, 50, altura_random));
            //aumenta a velocidade 
            this.#velocidadex += 0.6;
            //marca que o proximo obstaculo ja foi gerado
            this.proximoObstaculo = true;
        }else {
            //decrementa o tempo para gerar o próximo obstáculo
            this.tempoProximoObstaculo--;
        }//remove o obstaculo se ele sair da tela
        if (this.x <= 0 - this.largura){ 
            obstaculos.shift();

        }
    }
    // para o obstáculo
    pararObstaculo = function() {
        this.#velocidadex = 0;
    }
    //desenha o obstáculo no canvas
    desenhar = function () {
        ctx.drawImage(this.image, this.x, this.y, this.largura, this.altura);  
    }
}

//Inicialização dos objetos
//Array que armazena todos os obtaculos
const obstaculos = []
obstaculos.push(new Obstaculo(canvas.width -90, canvas.height -100, 50, 90));
//intancia do personagem
const personagem = new Personagem(80, canvas.height -100, 80, 100)

//recarrega a pagina se clicar na tela
// '(e) => {...}' callback = chama o jogo para reiniciar
document.addEventListener("click", (e) => {
    if (gameOver ==true){
        location.reload();
    }
})

//'keypress' faz o personagem pular quando a tecla do espaço é pressionada
document.addEventListener("keypress", (e) => {
    if (e.code == 'Space' && personagem.isPersonagemPulando() == false) {
        personagem.saltar();
        }
    })

    //
    //FUNÇÂO LOOP
    //
    function loop() {
        if (!gameOver) {
            //limpa o canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //desenha o personagem
            personagem.desenhar(ctx, 'white');
            //Para cada obstáculo, desenha, verifica colisão, verifica pontuação e atualiza.
            obstaculos.forEach((obstaculo) => {
                obstaculo.desenhar(ctx, 'red');
                personagem.verificarColisao(obstaculo);
                personagem.verificarPontuacao(obstaculo);
                obstaculo.atualizar();
            });
            //Atualiza e desenha a pontuação do personagem
            personagem.atualizar();
            personagem.desenhaPontuacao();
            //continua o loop
            requestAnimationFrame(loop);
        }
    }
    loop();

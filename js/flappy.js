const telaDoJogo = document.querySelector('[wm-flappy]')//Seleciona a div que esta com o atributo wm-flappy

function novoElemento(tagName,className){
	const newElement = document.createElement(tagName)//Cria um novo elemento
	newElement.classList.add(className)// Adiciona classe ao novo elemento

	return newElement//Retorna o novo elemento
}

function Barreira(reversa = false){
	this.elemento = novoElemento('div','barreira')//Cria um novo elemento com o tagName div e a class barreira

	const borda = novoElemento('div','borda')//Cria um novo elemento com o tagName div e a class borda
	const corpo = novoElemento('div','corpo')///Cria um novo elemento com o tagName div e a class corpo
	this.elemento.appendChild(reversa ? corpo : borda)//Faz uma lógica que se o atributo 'reversa' for true, ele coloca o elemento corpo antes e o elemento borda depois
	this.elemento.appendChild(reversa ? borda : corpo)

	this.setAltura = altura => {
		corpo.style.height = `${altura}px`//Coloca um height determinado em elementos com a classe corpo
	}
}

// const b = new Barreira(false)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura,abertura,x){
	this.elemento = novoElemento('div','par-de-barreiras')//Cria uma tag div com a class par-de-barreiras

	this.superior = new Barreira(true)//instancia a função Barreira com o atributo true, indicando que a primeira div vai ser com a class corpo, e a segunda div com a class borda
	this.inferior = new Barreira(false)//instancia a função Barreira com o atributo false, indicando que a primeira div vai ser com a class borda, e a segunda div com a class corpo

	this.elemento.appendChild(this.superior.elemento)//Coloca a barreira superior e inferior na div com a class par-de-barreiras
	this.elemento.appendChild(this.inferior.elemento)//Coloca a barreira inferior e inferior na div com a class par-de-barreiras

	this.sortearAbertura = () => {
		const alturaSuperior = Math.random() * (altura - abertura)//Faz um calcúlo indicando que a altura da barreira superior vai ser um numero random entre os atributos altura e abertura
		const alturaInferior = altura - abertura - alturaSuperior//Faz um calcúlo indicando que a altura da barreira inferior vai ser o calculo entre a altura, a abertura e a altura da barreira superior, evitando conflitos
		this.superior.setAltura(alturaSuperior)//Coloca a altura na barra superior
		this.inferior.setAltura(alturaInferior)//Coloca a altura na barra inferior
	}

	this.getX = () => parseInt(this.elemento.style.left.split('px')[0])//Pega o retorno de elemento.style.left e o transforma em um number
	this.setX = x => this.elemento.style.left = `${x}px`//Uma função que atribui o estilo left ao elemento
	this.getLargura = () => this.elemento.clientWidth //Pega a largura do elemento

	this.sortearAbertura()//Executa a função que vai fazer as barras serem geradas com um tamanho randomico
	this.setX(x)

}
// const b = new ParDeBarreiras(700,200,400)//Gera as barreiras
// telaDoJogo.appendChild(b.elemento)//Coloca as barreiras na tela do jogo

function Barreiras(altura,largura,abertura,espaco,notificarPonto){
	this.pares = [
		new ParDeBarreiras(altura,abertura,largura),
		new ParDeBarreiras(altura,abertura,largura + espaco),
		new ParDeBarreiras(altura,abertura,largura + espaco * 2),
		new ParDeBarreiras(altura,abertura,largura + espaco * 3)
	]

	const deslocamento = 3

	this.animar = () => {
		this.pares.forEach(par => {
			par.setX(par.getX() - deslocamento)

			//quando o elemento sair da tela
			if(par.getX() < -par.getLargura()){
				par.setX(par.getX() + espaco * this.pares.length)
				par.sortearAbertura()
			}
			const meio = largura / 2
			const cruzouMeio = par.getX() + deslocamento >= meio
			&& par.getX() < meio

			if(cruzouMeio){ notificarPonto()}
		})
	}
	this.resetBarreiras = () => {
		this.pares.forEach(e => {
		})
	}
}

function Passaro(alturaJogo){
	let voando = false

	this.elemento = novoElemento('img','passaro')
	this.elemento.src = 'imgs/passaro.png'

	this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
	this.setY = y => this.elemento.style.bottom = `${y}px`

	window.onkeydown = e => voando = true
	window.onkeyup = e => voando = false

	this.animar = () =>{
		const novoY = this.getY() + (voando ? 8 : -5)
		const alturaMaxima = alturaJogo - this.elemento.clientHeight

		if(novoY <= 0){
			this.setY(0)
		}else if (novoY >= alturaMaxima){
			this.setY(alturaMaxima)
		}else {
			this.setY(novoY)
		}
	}
	this.setY(alturaJogo/ 2)
}



function Progresso(){
	this.elemento = novoElemento('span','progresso')
	this.atualizarPontos = pontos => {
		this.elemento.innerHTML = pontos
	}
	this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA,elementoB){
	const a = elementoA.getBoundingClientRect()
	const b = elementoB.getBoundingClientRect()

	const horizontal =  a.left + a.width >= b.left && b.left + b.width >= a.left
	const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

	return horizontal && vertical
}

function colidiu(passaro,barreiras){ 	
	let colidiu = false

	barreiras.pares.forEach(par => {
		if(!colidiu){
			const superior = par.superior.elemento
			const inferior = par.inferior.elemento

			colidiu = estaoSobrepostos(passaro.elemento,superior) || estaoSobrepostos(passaro.elemento,inferior)
		}
	})
	return colidiu
}

function FlappyBird(){
	let pontos = 0

	const areaDoJogo = telaDoJogo
	const altura = areaDoJogo.clientHeight
	const largura = areaDoJogo.clientWidth

	const progresso = new Progresso()
	const barreiras = new Barreiras(altura,largura,200,400,() => progresso.atualizarPontos(++pontos))	

	const passaro = new Passaro(altura)

	areaDoJogo.appendChild(progresso.elemento)
	areaDoJogo.appendChild(passaro.elemento)
	barreiras.pares.forEach(e => areaDoJogo.appendChild(e.elemento))
	const qualquerTecla = document.querySelector('.qualquerTecla')

	this.start = () => {
		qualquerTecla.innerHTML = ''
		const temporizador = setInterval(() => {
			barreiras.animar()
			passaro.animar()
			
			if(colidiu(passaro,barreiras)){
				console.log('Colidiu')
				clearInterval(temporizador)
				qualquerTecla.innerHTML = 'Você perdeu! Reinicie a página para reiniciar'
				this.acabarJogo()
			}
		},20)
	}
}

window.onkeydown = () => {
	window.onkeydown = ''
	new FlappyBird().start()
	
}

// const progresso = new Progresso().elemento
// const barreiras = new Barreiras(700,1200,200,400)
// const passaro = new Passaro(700) 	
// const areaJogo = telaDoJogo

// areaJogo.appendChild(passaro.elemento)
// areaJogo.appendChild(progresso)
// barreiras.pares.forEach(par => {
// 	areaJogo.appendChild(par.elemento)
// })
// setInterval(() => {
// 	barreiras.animar()
// 	passaro.animar()
// },20)
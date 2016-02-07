// J'avoue on a été voir sur internet pour voir un peu comment ça fonctionne, mais nous avons plutôt compris, notamment la game loop et les évènements keyboard multiples
$(document).ready(function(){

// Construction de la logique 

/*****************************************
*										 *
*										 *
*										 *
*			Mécaniques du jeu		 	 *
*										 *
*										 *
*										 *
*										 *
******************************************/

var underPhysics = []; // Création d'un array qui contiendra les objets soumis à la gravité
obstacle = []; // Contiendra les ennemis visibles à l'écran
coin = []; // Contiendra les pièces visibles à l'écran
function generatePos(min , max){
	return Math.floor(Math.random() * (max - min)) + min;
}
function prepareObstacle(){
	for(obstacleId = 0; obstacleId < document.getElementsByClassName('bullet-bill').length; obstacleId++){
		pos = generatePos(sol.offsetTop -10 , sol.offsetTop-50);
		obstacle[obstacleId] = {id: obstacleId, selector : document.getElementsByClassName('bullet-bill')[obstacleId ] , width : document.getElementsByClassName('bullet-bill')[obstacleId].offsetWidth , 
		height : document.getElementsByClassName('bullet-bill')[obstacleId].offsetHeight , posY : pos , posX : document.getElementsByClassName('bullet-bill')[obstacleId].offsetLeft};
	}
}
function addObstacle(){
		$('body').append('<div class="bullet-bill"></div>');
		prepareObstacle();
}
function obstacleMove(){
	for(i = 0; i < obstacle.length; i++){
		obstacle[i].posX -=10;
		obstacle[i].selector.style.top =  obstacle[i].posY+"px"; 
		obstacle[i].selector.style.left = obstacle[i].posX+"px";
		if(obstacle[i].posX <= area.htmlElement.offsetLeft){
			obstacle[i].selector.parentNode.removeChild(obstacle[i].selector);
			obstacle = [];
			addObstacle();		
		}
	}
}
function prepareCoin(){
	for(coinId = 0; coinId < document.getElementsByClassName('coin').length; coinId++){
		pos = generatePos(sol.offsetTop -80 , sol.offsetTop -140);
		coin[coinId] = {id: coinId, selector : document.getElementsByClassName('coin')[coinId ] , width : document.getElementsByClassName('coin')[coinId].offsetWidth , 
		height : document.getElementsByClassName('coin')[coinId].offsetHeight , posY : pos , posX : document.getElementsByClassName('coin')[coinId].offsetLeft};
	}
}
function addCoin(){
		$('body').append('<div class="coin"></div>');
		prepareCoin();
}
function coinMove(){
	for(i = 0; i < coin.length; i++){
		coin[i].posX -=5;
		coin[i].selector.style.top =  coin[i].posY+"px"; 
		coin[i].selector.style.left = coin[i].posX+"px";
		if(coin[i].posX <= area.htmlElement.offsetLeft){
			coin[i].selector.parentNode.removeChild(coin[i].selector);
			coin = [];
			addCoin();		
		}
	}
}
function removeObject(element){ // Fonction qui permet de supprimer les obstacles et les pièces quand on perd le jeu et qu'on restart
	element.each(function(){
		$(this).remove();
	}); 
}
/*****************************************
*										 *
*										 *
*										 *
*			Objets du jeu		 		 *
*										 *
*										 *
*										 *
*										 *
******************************************/


zoneDeJeu = function(selector , ground){// Définition d'un objet "zone de jeu", qui nous permettra notamment de détecter certaines colisions (gauche et droite du viewport) et eclenche la gravité
	this.htmlElement = selector;
	this.sol = ground;
	this.leftBorder = selector.offsetLeft;	
	this.height = selector.offsetHeight;
	this.touched = true; // Variable pour détecter les collisions (empéche de décrémenter la vie tant qu'on est en collision)
	this.touchedCoins = true;
	this.music = document.getElementById('audio-bg');
	zoneDeJeu.prototype.gravity = function(){				
		for(i = 0; i < underPhysics.length; i++){
			var object = underPhysics[i];
			if(!object.jump()){
				if(object.htmlElement.offsetTop < this.sol.offsetTop - object.htmlElement.offsetHeight){
					object.pos.y += 10;
					object.htmlElement.style.top = object.pos.y+"px";
					object.falling = true;
				}else if(object.htmlElement.offsetTop >= this.sol.offsetTop - object.htmlElement.offsetHeight){
					object.pos.y = this.sol.offsetTop  - object.htmlElement.offsetHeight;
					object.htmlElement.style.top = object.pos.y+"px";
					object.falling = false;
					
				}
			}
		}
	}
	zoneDeJeu.prototype.collisions = function(){ // On pourrait, je pense, largement améliorer cette partie, mais manque de temps...
		for(i = 0; i < underPhysics.length; i++){
			var object = underPhysics[i];
			for(i = 0; i < obstacle.length; i++){
				var elwidth = obstacle[i].width,
				elheight = obstacle[i].height,
				elTop = obstacle[i].posY,
				elLeft = obstacle[i].posX,
				elRight = elLeft + elwidth,
				elBottom = elTop + elheight;
				if(elLeft < object.pos.x + object.width && elRight > object.pos.x && elTop < object.pos.y + object.height && elBottom > object.pos.y){ // Détection de la collision
					if(this.touched  === false){ // On regarde tout d'abords si on a déjà touché un obstacle
					}
					else{ // La première fois qu'on le touche, on enlève une vie.
						object.life -= 1;
						if (object.life >= 1) {
							document.getElementById("audio-hited").play();
						}
						this.touched  = false; // Et on remet touched à false pour empêcher que la vie se décremente tant qu'on touche l'objet
					}
				}
				else{
					this.touched = true; // Quand on ne touche plus l'objet, on réinitialise à true, pour le prochain objet rencontré
				}
				
			}
			for(i = 0; i < coin.length; i++){
				var elwidth = coin[i].width,
				elheight = coin[i].height,
				elTop = coin[i].posY,
				elLeft = coin[i].posX,
				elRight = elLeft + elwidth,
				elBottom = elTop + elheight;
				if(elLeft < object.pos.x + object.width && elRight > object.pos.x && elTop < object.pos.y + object.height && elBottom > object.pos.y){ // Détection de la collision
					if(this.touchedCoins  === false){ // On regarde tout d'abords si on a déjà touché une piece
					}
					else{ // La première fois qu'on le touche, on ajoute une piece.
						object.coins +=1;
						document.getElementById("audio-coin").play();
						this.touchedCoins  = false; // Et on remet touched à false pour empêcher que les pieces s'incrémentent tant qu'on touche l'objet
						coin[i].posX = 0; // La pièce a été récupérée, elle disparait de l'écran de jeu
					}
				}
				else{
					this.touchedCoins = true; // Quand on ne touche plus la piece, on réinitialise à true, pour le prochain objet rencontré
				}
				
			}
		}	
	}
}

joueur = function(selector , speed ){ // Définition d'un objet joueur
	this.htmlElement = selector;
	this.width = selector.offsetWidth;
	this.height = selector.offsetHeight;
	this.life = 3;
	this.coins = 0;
	this.velocity = speed;
	this.collision = false;
	this.pos = {x : 0 , y : 0};
	this.falling = true; // Pour empécher le saut alors que le personnage est en l'air
	this.jumpPower = 5;
	this.pressJump = 0;
	this.reverse = false;
	joueur.prototype.move = function() { // Méthode pour bouger à gauche et à droite (On pourrait l'optimiser car c'est très brouillon mais manque de temps)
		if (key.right === true) { // Si on appui sur la fleche de droite, on incremente la propriété css "left" par la vitesse passée à l'objet
				this.pos.x += this.velocity; 	

        	if(key.up === false){
        		this.htmlElement.className = ('walking-right');
        	}       	
    		 this.reverse = false;
    	} 
    	else if (key.left === true){ // Inverse du dessus
    			this.pos.x -= this.velocity;
    		if(key.up === false){
        		this.htmlElement.className = ('walking-left');
        	}    
    		 this.reverse = true;
    	}// Détection des collisions avec les limites du viewport
    	if(this.pos.x <= area.leftBorder){ // Si la position est inférieure au coin gauche de l'écran, la position du joueur revient à "left:0"
    		this.pos.x = 0;
    	}
    	if(this.pos.x > area.htmlElement.offsetWidth - this.width){ // Si on est supérieur à la largeur du viewport (donc coin droit), on revient à "left:viewportWidth - joueurWidth"
    		this.pos.x = area.htmlElement.offsetWidth - this.width;
    	}
    	if(key.right === false && key.left === false && key.up === false && this.falling === false){
    		this.htmlElement.className = ('');
    		if(this.reverse){
    			this.htmlElement.className = ('reverse');
    		}
    	}
    	if(this.falling === true){
    		switch(this.reverse){
    		case true:
    		this.htmlElement.className = ('fall reverse');
    		break;
    		case false:
    		this.htmlElement.className = ('fall');
    		break;
    		}
    	}
    	this.htmlElement.style.left = this.pos.x+"px";
    	document.getElementById('counter').innerHTML = this.life;
    	document.getElementById('coin_count').innerHTML = this.coins;
	}
	joueur.prototype.jump = function(){
		if(key.up === true && this.falling == false){
				document.getElementById('audio-jump').play();
				this.pressJump++;
				if(this.reverse){
					this.htmlElement.className = ('jump reverse');	
				}
				else{
					this.htmlElement.className = ('jump');
				}		
				if(this.pressJump < 50){
					this.pos.y -= this.jumpPower;
					this.htmlElement.style.top = this.pos.y+"px";
					this.falling = false;
					return true;
				}
				else{
					key.up = false;
				}
				/*while (this.pos.y  > i){		
				this.pos.y -= 1;
				this.htmlElement.style.top = this.pos.y+"px";
				this.falling = false;
				return true;
				}*/
		}
		if(key.up === false){
			this.pressJump = 0;
		}
	}
	underPhysics.push(this);
	joueur.prototype.lose = function(){
		if(this.life <= 0){
			this.htmlElement.className = 'die';
			losegame($('body'));
		}
	}
}
/*****************************************
*										 *
*										 *
*										 *
*				Contrôles		 		 *
*										 *
*										 *
*										 *
*										 *
******************************************/
var key  = { // On créé un objet clef qui permettra d'enregistrer de détecter si une touche est enfoncée ou non (et la détection de plusieurs touches enfoncées)
	left:false,
	right:false,
	up:false,
}
function keyDown(e) {
	
    if (e.keyCode === 39) {
        key.right = true;
    } else if (e.keyCode === 37) {
        key.left = true;
    }
    if (e.keyCode === 38) {
        key.up = true;
    }
    if (e.keyCode === 32) {
        pauseGame();
    }
}

function keyUp(e) {
    if (e.keyCode === 39) {
        key.right = false;
    } else if (e.keyCode === 37) {
        key.left = false;
    }
    if (e.keyCode === 38) {
        key.up = false;
    }
    if (e.keyCode === 32){
       	key.bar = false;
    }
}
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

/*****************************************
*										 *
*										 *
*										 *
*		Contrôles de la game loop		 *
*		(start, pause, lose etc...)		 *
*										 *
*										 *
*										 *
******************************************/

function startGame(){
	$('#menu').hide();
	$('#personnage').css({'display':'inline-block'});
	$('#lives').show();
	$('#coins').show();
	mario = new joueur(document.getElementById("personnage") ,7); // Création du joueur
	area = new zoneDeJeu(document.body , document.getElementById("sol")); // Notre zone est le body.
	addCoin();
	addObstacle();
	gameloop = setInterval(loop,15);

}

function pauseGame(){
	if($('body').hasClass('paused')){
		$('body').removeClass('paused');
		gameloop=setInterval(loop,15);
	}
	else{
		$('body').addClass('paused');
		area.music.pause()
		document.getElementById("audio-pause").play();
		clearInterval(gameloop);
	}
}
function losegame(element){ // On met en pause et on reset tous les objets et arrays.
	area.music.pause()
	document.getElementById('audio-gameover').play();
	element.addClass('gameover');
	clearInterval(gameloop);
	delete mario;
	delete area;
	underPhysics = [];
	obstacle = [];
	coin = [];
}
function restartGame(){
	removeObject($('.bullet-bill'));
	removeObject($('.coin'));
	$('body').removeClass('gameover');
	mario = new joueur(document.getElementById("personnage") ,7); // Création du joueur
	area = new zoneDeJeu(document.body , document.getElementById("sol")); // Notre zone est le body.
	area.music.load();
	addCoin();
	addObstacle();
	gameloop=setInterval(loop,15);
}

// Il est nécéssaire de créer une loop pour que les fonctions soient lancées constamment
function loop(){
	area.music.play();
	obstacleMove()
	coinMove();
	area.collisions();
	area.gravity();
	mario.move();
	mario.lose();
}

$('#retry').click(function(){
	restartGame();
});
$('#start').click(function(){
	startGame();
});

});
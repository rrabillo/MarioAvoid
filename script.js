// J'avoue on a été voir sur internet pour voir un peu comment ça fonctionne, mais nous avons plutôt compris, notamment la game loop et les évènements keyboard multiples
$(document).ready(function(){

// Construction de la logique 


var underPhysics = []; // Création d'un array qui contiendra les objets soumis à la gravité
obstacle = [];
function generatePos(min , max){
	return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomInt(min, max) {
  	/*console.log(Math.floor(Math.random() * (max - min)) + min);*/
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
addObstacle();
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
zoneDeJeu = function(selector , ground){// Définition d'un objet "zone de jeu", qui nous permettra notamment de détecter certaines colisions (gauche et droite du viewport) et eclenche la gravité
	this.htmlElement = selector;
	this.sol = ground;
	this.leftBorder = selector.offsetLeft;	
	this.height = selector.offsetHeight;
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
	zoneDeJeu.prototype.collisions = function(){
		for(i = 0; i < underPhysics.length; i++){
			var object = underPhysics[i];
			for(i = 0; i < obstacle.length; i++){
				var elwidth = obstacle[i].width,
				elheight = obstacle[i].height,
				elTop = obstacle[i].posY,
				elLeft = obstacle[i].posX,
				elRight = elLeft + elwidth,
				elBottom = elTop + elheight;
				if(elLeft < object.pos.x + object.width && elRight > object.pos.x && elTop < object.pos.y + object.height && elBottom > object.pos.y ){
					console.log('ok');
				}	
			}
		}	
	}
}
	
/*obstacle = function(selector){
	this.status = true; // Si l'objet a disparu ou non
	this.htmlElement = selector;
	for(i = 0; i < selector.length; i++){
		this.height = selector[i].offsetHeight;
		this.width = selector[i].offsetWidth;
	}
	this.pos = {x : area.htmlElement.offsetWidth - this.width , y : area.sol.offsetTop - 15}; 
	obstacle.prototype.move = function(){
		this.pos.x -= 5;
		this.htmlElement[0].style.top = this.pos.y+"px";
		this.htmlElement[0].style.left = this.pos.x+"px";
		if(this.pos.x <= area.leftBorder){
		}
	}

} */
joueur = function(selector , speed ){ // Définition d'un objet joueur
	this.htmlElement = selector;
	this.width = selector.offsetWidth;
	this.height = selector.offsetHeight;
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
	}
	joueur.prototype.jump = function(){
		if(key.up === true && this.falling == false){
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

}

mario = new joueur(document.getElementById("personnage") ,7); // Création du joueur
area = new zoneDeJeu(document.body , document.getElementById("sol")); // Notre zone est le body.
/*
bulletbill = new obstacle(document.getElementsByClassName("bullet-bill"));
*/
// Contrôles
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
       	
    }
}
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

	mario.jump();
// Il est nécéssaire de créer une loop pour que les fonctions soient lancées constamment
function loop(){	
	obstacleMove()
	area.collisions();
	area.gravity();
	mario.move();
}
 gameloop = setInterval(loop,15);


$('body').click(function(){ // Fonction de pause
	if($(this).hasClass('paused')){
		$(this).removeClass('paused');
		gameloop=setInterval(loop,15);;
	}
	else{
		$(this).addClass('paused');
		clearInterval(gameloop);
	}
});
});
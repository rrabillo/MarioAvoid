// J'avoue on a été voir sur internet pour voir un peu comment ça fonctionne, mais nous avons plutôt compris, notamment la game loop et les évènements keyboard multiples
$(document).ready(function(){

// Construction de la logique 


var underGravity = []; // Création d'un array qui contiendra les objets soumis à la gravité
zoneDeJeu = function(selector){// Définition d'un objet "zone de jeu", qui nous permettra notamment de détecter certaines colisions (gauche et droite du viewport) et eclenche la gravité
	this.htmlElement = selector;
	this.leftBorder = selector.offsetLeft;	
	this.height = selector.offsetHeight;
	zoneDeJeu.prototype.gravity = function(){				
		for(i = 0; i < underGravity.length; i++){
			var object = underGravity[i];
			if(!object.jump()){
				if(object.htmlElement.offsetTop < this.height - object.htmlElement.offsetHeight){
					object.pos.y += 10;
					object.htmlElement.style.top = object.pos.y+"px";
					object.falling = true;
				}else if(object.htmlElement.offsetTop >= this.height - object.htmlElement.offsetHeight){
					object.pos.y = this.height - object.htmlElement.offsetHeight;
					object.htmlElement.style.top = object.pos.y+"px";
					object.falling = false;
					
				}
			}
		}
	}
} 
joueur = function(selector , speed ){ // Définition d'un objet joueur
	this.htmlElement = selector;
	this.width = selector.offsetWidth;
	this.height = selector.offsetHeight;
	this.velocity = speed;
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
	underGravity.push(this);

}
mario = new joueur(document.getElementById("personnage") ,7); // Création du joueur
area = new zoneDeJeu(document.body); // Notre zone est le body.
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
}
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

	mario.jump();
// Il est nécéssaire de créer une loop pour que les fonctions soient lancées constamment
function loop(){
	area.gravity();
	mario.move();
}
setInterval(loop,15);
});
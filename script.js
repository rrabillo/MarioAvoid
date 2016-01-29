// J'avoue on a été voir sur internet pour voir un peu comment ça fonctionne, mais nous avons plutôt compris, notamment la game loop et les évènements keyboard multiples
$(document).ready(function(){

// Construction de la logique 


var underGravity = []; // Création d'un array qui contiendra les objets soumis à la gravité

zoneDeJeu = function(selector){// Définition d'un objet "zone de jeu", qui nous permettra notamment de détecter certaines colisions (gauche et droite du viewport) et eclenche la gravité
	this.htmlElement = selector;
	this.leftBorder = selector.offsetLeft;	
	this.height = selector.offsetHeight;
	zoneDeJeu.prototype.gravity = function(){ // Ok la ça va être chaud EDIT : Wouhou j'ai réussi					
		for(i = 0; i < underGravity.length; i++){
			var object = underGravity[i];
			if(!object.jump()){
				if(object.htmlElement.offsetTop < this.height - object.htmlElement.offsetHeight){
					object.pos.y += 5;
					object.htmlElement.style.top = object.pos.y+"px"; 
				}else if(object.htmlElement.offsetTop >= this.height - object.htmlElement.offsetHeight){
					object.pos.y = this.height - object.htmlElement.offsetHeight;
					object.htmlElement.style.top = object.pos.y+"px";
					
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
	this.falling = true;
	joueur.prototype.move = function() { // Méthode pour bouger à gauche et à droite
		if (key.right === true) { // Si on appui sur la fleche de droite, on incremente la propriété css "left" par la vitesse passée à l'objet
        	this.pos.x += this.velocity;
    	} 
    	else if (key.left === true){ // Inverse du dessus
    		this.pos.x -= this.velocity;
    	}// Détection des collisions avec les limites du viewport
    	if(this.pos.x <= area.leftBorder){ // Si la position est inférieure au coin gauche de l'écran, la position du joueur revient à "left:0"
    		this.pos.x = 0;
    	}
    	if(this.pos.x > area.htmlElement.offsetWidth - this.width){ // Si on est supérieur à la largeur du viewport (donc coin droit), on revient à "left:viewportWidth - joueurWidth"
    		this.pos.x = area.htmlElement.offsetWidth - this.width;
    	}
    	this.htmlElement.style.left = this.pos.x+"px";
	}
	joueur.prototype.jump = function(){
		if(key.up === true){
				console.log(this.pos.y);
				this.pos.y -= 5;
				this.htmlElement.style.top = this.pos.y+"px";
				this.falling = false;
				return true;
			
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
	top:false,
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

// Il est nécéssaire de créer une loop pour que les fonctions soient lancées constamment
function loop(){
	area.gravity();
	mario.move();
	mario.jump();
}
setInterval(loop,15);
});
$(document).ready(function(){
	var gravityValue = 200;
	var mario = $('#personnage');
	var personne = function(selector){
		if(selector.position().top < $(document).height()){
			gravity(selector);
		}

		personne.prototype.jump = function() {
			console.log('ok');
		  	selector.animate({
			top: "-=25px"
			}, gravityValue);
			gravity(selector);
		}
	}
	var joueur = new personne(mario);
	function gravity(selector){
		selector.animate({
			top: $(document).height() - selector.height() - 15
		}, gravityValue);
	}
	document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            break;
        case 38:
        	joueur.jump();
            break;
        case 39:
            break;
        case 40:
            break;
    }
};
});
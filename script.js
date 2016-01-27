$(document).ready(function(){
	var gravityValue = 5;
	var mario = $('#personnage');
	var personne = function(selector){
		$(selector).css({'top':gravity(gravityValue)});
	}
	var personne1 = new personne(mario);

	function gravity(value){
		setInterval(function() {
       		value++;
		}, 100);
		return(value);
	}
	gravity(gravityValue);
});
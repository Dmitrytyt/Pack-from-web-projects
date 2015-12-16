/**
 * Created by Admin on 8.11.15.
 */

var actionList = (function(){

    var catalog = $( '.product-catalog' );

    var init = function (){
        _setUpListens();
    };

    // Listens for events
    var _setUpListens = function(){
        $( 'body' ).on( 'click', function(e){
            _setElem(e);
        });
    };

    // Set click elem
    var _setElem = function(e){
        e.preventDefault();

        var targetElem = $( e.target );

        if(targetElem.is( ".icon-full-list" )){
            _showFullList(e);
            return;
        }

    };

    // Show full list
    var _showFullList = function(e) {
        catalog.addClass( 'product-catalog__full-list' );
    };

    // Return object (public methods)
    return {
      init: init
    }

})();




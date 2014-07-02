/**
  toggle the code examples
*/

(function (global) {
  var codeIsHidden = false,
      marginedElements = [],
      $darkBox,
      $code;

  function cacheElements() {
    var marginSize = $('.content').width() / 2;

    // Since all the center dom elements do not have a consistent parenting tree or class name,
    //  we have to pull the elements based on their having a right margin of 50%
    $("*").each(function() {
      if ( $(this).css('margin-right') == marginSize + 'px' ) {
        marginedElements.push($(this));
      }
    });

    $darkBox = $('.dark-box');
    $code = $('pre, blockquote');
  }

  function toggle() {
    $(this).toggleClass('code-visible');

    if ( codeIsHidden ) {
      marginedElements.forEach( function($el) {
        $el.css('margin-right', '50%');
      });
      $darkBox.css('width', '50%');
      $code.css({'width': '50%', 'padding': '2em 28px'});
    } else {
      marginedElements.forEach( function($el) {
        $el.css('margin-right', '0');
      });
      $darkBox.css('width', '0');
      $code.css({'width': '0', 'padding': '0'});
    }

    codeIsHidden = !codeIsHidden;
  }

  // Toggle the code sidebar when the toggle button is clicked
  // $(function() {
  //   cacheElements();
  //   $("#toggle_code").on("click", toggle);
  // });
})(window);

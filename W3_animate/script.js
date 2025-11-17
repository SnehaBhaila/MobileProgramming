 $(document).ready(function(){
    $("button").click(function(){
      var div = $("div");

      // Step 1: Slide to right
      div.animate({left: '200px'}, "slow")

      // Step 2: Increase height
      .animate({height: '200px'}, "slow")

      // Step 3: Increase width
      .animate({width: '200px'}, "slow")

      // Step 4: Change transparency
      .animate({opacity: '0.5'}, "slow")

      // Step 5: Change color to pink
      .queue(function(next){
        div.css("background-color", "pink");
        next();
      })

      // Step 6: Decrease height
      .animate({height: '100px'}, "slow")

      // Step 7: Decrease width
      .animate({width: '100px'}, "slow")

      // Step 8: Back to original position, color, and opacity
      .animate({left: '0px', opacity: '1'}, "slow")
      .queue(function(next){
        div.css("background-color", "#98bf21"); // original green
        next();
      });
    });
  });
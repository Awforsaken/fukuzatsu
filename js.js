$(document).ready(function() {
  var combinations = {
      hand1: {
          name: "High Card",
          chip: 10,
          multi: 1
      },
      hand2: {
          name: "Pair",
          chip: 10,
          multi: 2
      },
      hand3: {
        name: "Two Pair",
        chip: 20,
        multi: 2
      },
      hand4: {
        name: "Three of a Kind",
        chip: 30,
        multi: 3
      }
  };

  // Initialize totals
  var totalChip = 0;
  var totalMulti = 0;
  
  // Update the display function
  function updateDisplay() {
      $('.points-card.chip').text(totalChip);
      $('.points-card.multi').text(totalMulti);
      $('.points-card.total').text(totalChip * totalMulti);
  }

  // Button click handler
  $('.hand').on('click', function() {
      var buttonId = $(this).attr('id');
      var combination = combinations[buttonId];
      
      if (combination) {
          // Reset totals
          totalChip = combination.chip;
          totalMulti = combination.multi;

          // Update the hand type display
          $('#hand-type').html(combination.name);

          // Update the display of chip, multi, and total
          updateDisplay();
      } else {
          $('#hand-type').html('No combination found for this button.');
      }
  });
  
  // Initial display update
  updateDisplay();
});

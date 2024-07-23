$(document).ready(function() {
  var combinations = {
      hand1: { name: "High Card", chip: 10, multi: 1 },
      hand2: { name: "Pair", chip: 10, multi: 2 },
      hand3: { name: "Two Pair", chip: 20, multi: 2 },
      hand4: { name: "Three of a Kind", chip: 30, multi: 3 },
      hand5: { name: "Straight", chip: 30, multi: 4 },
      hand6: { name: "Flush", chip: 35, multi: 4 },
      hand7: { name: "Full House", chip: 40, multi: 4 },
      hand8: { name: "Four of a Kind", chip: 60, multi: 7 },
      hand9: { name: "Straight Flush", chip: 100, multi: 8 },
      hand10: { name: "Royal Flush", chip: 100, multi: 8 },
      hand11: { name: "Five of a Kind", chip: 120, multi: 12 },
      hand12: { name: "Flush House", chip: 140, multi: 14 }
  };

  var cardchips = {
      cardchip1: { name: "Ace", chip: 11 },
      cardchip2: { name: "King", chip: 10 },
      cardchip3: { name: "Queen", chip: 10 },
      cardchip4: { name: "Jack", chip: 10 },
      cardchip5: { name: "10", chip: 10 },
      cardchip6: { name: "9", chip: 9 },
      cardchip7: { name: "8", chip: 8 },
      cardchip8: { name: "7", chip: 7 },
      cardchip9: { name: "6", chip: 6 },
      cardchip10: { name: "5", chip: 5 },
      cardchip11: { name: "4", chip: 4 },
      cardchip12: { name: "3", chip: 3 },
      cardchip13: { name: "2", chip: 2 }
  };

  var totalChip = 0;
  var totalMulti = 0;
  var log = [];

  function updateDisplay() {
      $('.points-card.chip').text(totalChip);
      $('.points-card.multi').text(totalMulti);
      $('.points-card.total').text(totalChip * totalMulti);
  }

  function updateLog(name, chip, multi, type) {
      var logEntry = $('<div class="log-entry"></div>');

      var logMessage;
      if (type === 'hand-log') {
          logMessage = `
              <span class="name-log">${name}:</span>
              <div class="values-container">
                <div class="values">
                <span class="chip-log">${chip}</span>
                <span> X </span>
                <span class="multi-log">${multi}</span>
                </div>
                 <span class="undo">undo</span></div>`;
      } else if (type === 'chip-log') {
          logMessage = `
              <span class="name-log">${name}:</span>
              <div class="values-container">
                <div class="values">
                  <span class="chip-log">+${chip}</span>
                 </div>
                 <span class="undo">undo</span></div>`;
      } else if (type === 'multi-log') {
          logMessage = `
              <span class="name-log">${name}:</span>
              <div class="values-container">
                <div class="values">
                  <span class="multi-log">+${multi}</span>
                </div>
                <span class="undo">undo</span></div>`;
      }

      logEntry.html(logMessage);
      logEntry.attr('data-type', type); // Add data-type attribute

      logEntry.on('click', function() {
          var entryText = $(this).text();
          var entryType = $(this).data('type'); // Get the entry type
          undoLogEntry(entryText, entryType);
          $(this).remove();
      });

      $('#log').append(logEntry);
      log.push({ name, chip, multi, type });
  }

  function undoLogEntry(entryText, type) {
      console.log("Undoing log entry:", entryText); // Debug log

      // Regex to extract chip and multi values
      var chipMatch = entryText.match(/\+?\d+/g); // Match any positive or negative integer
      var multiMatch = entryText.match(/(?:\+)?(\d+)/i); // Match '+<number>'

      console.log("chipMatch:", chipMatch);
      console.log("multiMatch:", multiMatch);

      if (type === 'hand-log') {
          // Actions specific to hand-log undo
          $('.hand').removeClass('selected'); // Remove .selected from all hands
          $('.hand-options').removeClass('hide').addClass('show'); // Show hand options
          $('.card-options, .reset-hand').removeClass('show').addClass('hide'); // Hide card options
          $('#hand-type').html('Select hand');
          $('#log').empty(); // Clear the log
          totalChip = 0; // Reset totalChip
          totalMulti = 0; // Reset totalMulti

          $('#extra-chip-value').val(''); // Clear chip input field
          $('#extra-multi-value').val(''); // Clear multi input field

          // Reset display values
          updateDisplay();
      } else if (type === 'chip-log') {
          if (chipMatch) {
              var chipValue = parseInt(chipMatch[0]);
              totalChip -= chipValue;
              console.log("Parsed chip value:", chipValue); // Debug log
          }
      } else if (type === 'multi-log') {
          if (multiMatch) {
              var multiValue = parseInt(multiMatch[1]);
              totalMulti -= multiValue;
              console.log("Parsed multi value:", multiValue); // Debug log
          }
      }

      updateDisplay();
  }

  // Add chip value
  $('#add-chip-value').on('click', function() {
      var chipValue = parseInt($('#extra-chip-value').val());

      if (isNaN(chipValue) || chipValue <= 0) {
          alert('Please enter a valid chip value.');
          return;
      }

      totalChip += chipValue;
      updateLog('Extra Chips', chipValue, '', 'chip-log');
      updateDisplay();
      $('#extra-chip-value').val(''); // Clear chip input field

  });

  // Add multi value
  $('#add-multi-value').on('click', function() {
      var multiValue = parseInt($('#extra-multi-value').val());

      if (isNaN(multiValue) || multiValue <= 0) {
          alert('Please enter a valid multi value.');
          return;
      }

      totalMulti += multiValue;
      updateLog('Extra Multi', '', multiValue, 'multi-log');
      updateDisplay();
      $('#extra-multi-value').val(''); // Clear multi input field
  });

  // Hand value click handler
  $('.hand').on('click', function() {
      var buttonId = $(this).attr('id');
      var combination = combinations[buttonId];
      $('.hand-options').removeClass('show').addClass('hide');
      $('.card-options, .reset-hand').removeClass('hide').addClass('show');
      $('#card-options-step').prop('disabled', false);

      if (combination) {
          // Remove .selected from all .hand elements
          $('.hand').removeClass('selected');

          // Add .selected to the clicked .hand element
          $(this).addClass('selected');

          totalChip = combination.chip;
          totalMulti = combination.multi;

          $('#log').empty();
          log = [];

          updateLog(combination.name, combination.chip, combination.multi, 'hand-log');

          $('#hand-type').html(combination.name);

          updateDisplay();
      } else {
          $('#hand-type').html('No combination found for this button.');
      }
  });

  // Card chip click handler
  $('.card-chip').on('click', function() {
      var buttonId = $(this).attr('id');
      var cardchip = cardchips[buttonId];

      if (cardchip) {
          totalChip += cardchip.chip;

          updateLog(cardchip.name, cardchip.chip, '', 'chip-log');

          updateDisplay();
      } else {
          console.log('Card chip not found:', buttonId);
      }
  });

  // Reset Hand button click handler
  $('#reset-hand').on('click', function() {
      undoLogEntry('Resetting hand', 'hand-log');
  });

  updateDisplay();
});

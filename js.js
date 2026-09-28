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
      hand12: { name: "Flush House", chip: 140, multi: 14 },
      hand13: { name: "Fuller House", chip: 155, multi: 15 }
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

  // Shared empty-state markup for breakdown and round scores
  var EMPTY_STATE_HTML = '<div class="small-text">No played hands</div>';

  var totalChip = 0;
  var totalMulti = 0;
  var log = [];

  // --- Multi-player tracking ---
  var MAX_PLAYERS = 10;
  var players = [];       // saved final scores, one per player, in save order
  var handActive = false; // true while the current player has a hand selected

  function renderPlayers() {
      var container = $('.player-points');
      container.empty();

      // Saved players, plus the current player's live score while a hand is in progress
      var entries = players.map(function(points) {
          return { points: points, live: false };
      });

      if (handActive && players.length < MAX_PLAYERS) {
          entries.push({ points: totalChip * totalMulti, live: true });
      }

      if (entries.length === 0) {
          container.html(EMPTY_STATE_HTML);
          return;
      }

      var maxPoints = Math.max.apply(null, entries.map(function(e) { return e.points; }));

      entries.forEach(function(e, i) {
          var playerLabel = 'P' + (i + 1);
          var isWinner = e.points === maxPoints;
          var diff = maxPoints - e.points;

          var entry = $('<div class="player-entry grid-3 small-text"></div>');
          entry.attr('data-player-index', i);

          if (e.live) {
              entry.addClass('current'); // the player being calculated right now
          }

          if (isWinner) {
              entry.addClass('winner');
              entry.html(
                  '<span class="player-label">' + playerLabel + '</span>' +
                  '<span class="player-diff">winner</span>' +
                  '<span class="player-score">' + e.points + ' pts</span>'
              );
          } else {
              entry.html(
                  '<span class="player-label">' + playerLabel + '</span>' +
                  '<span class="player-diff">-' + diff + '</span>' +
                  '<span class="player-score">' + e.points + ' pts</span>'
              );
          }

          container.append(entry);
      });
  }

  function resetHandForNextPlayer() {
      // Re-uses the same reset behaviour as "Start again", without touching players[]
      undoLogEntry('Resetting hand', 'hand-log');
  }

  function updateDisplay() {
      $('.points-card.chip').text(totalChip).addClass('wiggle');
      $('.points-card.multi').text(totalMulti).addClass('wiggle');
      $('.points-card.total').text(totalChip * totalMulti).addClass('wiggle');
      setTimeout(function() {
          $('.points-card.chip, .points-card.multi, .points-card.total').removeClass('wiggle');
      }, 300); // Match the duration of the wiggle animation

      // Every point change (hand, card, extras, undo) also refreshes the players list
      renderPlayers();

      // Empty breakdown placeholder
      if ($('#log').children().length === 0) {
          $('#log').html(EMPTY_STATE_HTML);
      }
  }

  $('#open-modal').on('click', function() {
    $('#about-modal').css('display', 'flex');
});

// Close the modal when the close button is clicked
$('#close-modal').on('click', function() {
    $('#about-modal').css('display', 'none');
});

// Close the modal when clicking outside the modal content
$(window).on('click', function(event) {
    if ($(event.target).is('#about-modal')) {
        $('#about-modal').css('display', 'none');
    }
});

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
          updateDisplay(); // refresh so the empty placeholder can appear if the log is now empty
      });

      $('#log').append(logEntry);
      log.push({ name, chip, multi, type });
  }

  function changeBackgroundColor() {
      var colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFFF33'];
      var randomColor = colors[Math.floor(Math.random() * colors.length)];
      $('body').css('background-color', randomColor);
  }

  function undoLogEntry(entryText, type) {
      console.log("Undoing log entry:", entryText);

      var chipMatch = entryText.match(/\+?\d+/g);
      var multiMatch = entryText.match(/(?:\+)?(\d+)/i);

      console.log("chipMatch:", chipMatch);
      console.log("multiMatch:", multiMatch);

      if (type === 'hand-log') {
          handActive = false; // no live entry once the hand is cleared

          $('.hand').removeClass('selected');
          $('.hand-options, hand-actions').removeClass('hide').addClass('show');
          $('.card-options, .hand-actions').removeClass('show').addClass('hide');
          $('#hand-type').html('Select hand');
          $('body').toggleClass('bg-hand');
          $('#log').empty();
          totalChip = 0;
          totalMulti = 0;

          $('#extra-chip-value').val('');
          $('#extra-multi-value').val('');

          updateDisplay();
      } else if (type === 'chip-log') {
          if (chipMatch) {
              var chipValue = parseInt(chipMatch[0]);
              totalChip -= chipValue;
              console.log("Parsed chip value:", chipValue);
          }
      } else if (type === 'multi-log') {
          if (multiMatch) {
              var multiValue = parseInt(multiMatch[1]);
              totalMulti -= multiValue;
              console.log("Parsed multi value:", multiValue);
          }
      }

      updateDisplay();
  }

  $('#add-chip-value').on('click', function() {
      var chipValue = parseInt($('#extra-chip-value').val());

      if (isNaN(chipValue) || chipValue <= 0) {
          alert('Please enter a valid chip value.');
          return;
      }

      totalChip += chipValue;
      updateLog('Extra Chips', chipValue, '', 'chip-log');
      updateDisplay();
      $('#extra-chip-value').val('');
  });

  $('#add-multi-value').on('click', function() {
      var multiValue = parseInt($('#extra-multi-value').val());

      if (isNaN(multiValue) || multiValue <= 0) {
          alert('Please enter a valid multi value.');
          return;
      }

      totalMulti += multiValue;
      updateLog('Extra Multi', '', multiValue, 'multi-log');
      updateDisplay();
      $('#extra-multi-value').val('');
  });

  $('.hand').on('click', function() {
      var buttonId = $(this).attr('id');
      var combination = combinations[buttonId];
      $('.hand-options').removeClass('show').addClass('hide');
      $('.card-options, .hand-actions').removeClass('hide').addClass('show');
      $('body').toggleClass('bg-hand');
      $('#card-options-step').prop('disabled', false);

      if (combination) {
          $('.hand').removeClass('selected');
          $(this).addClass('selected');

          totalChip = combination.chip;
          totalMulti = combination.multi;
          handActive = true; // start showing this player's live score

          $('#log').empty();
          log = [];

          updateLog(combination.name, combination.chip, combination.multi, 'hand-log');

          $('#hand-type').html(combination.name);

          updateDisplay();
      } else {
          $('#hand-type').html('No combination found for this button.');
      }
  });

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

  // "Next player": bank the current total as this player's score. The reset
  // below clears handActive, so the live entry becomes a saved entry.
  $('#save-hand').on('click', function() {
      if (players.length >= MAX_PLAYERS) {
          alert('Maximum of ' + MAX_PLAYERS + ' players reached.');
          return;
      }

      var finalScore = totalChip * totalMulti;
      players.push(finalScore);

      resetHandForNextPlayer(); // also re-renders via updateDisplay()
  });

  // "Start again": full reset, including clearing all saved players.
  // Only the buttons carry the .reset-hand class (the container is .hand-actions).
  $('.reset-hand').on('click', function() {
      players = [];
      undoLogEntry('Resetting hand', 'hand-log'); // also re-renders via updateDisplay()
  });

  updateDisplay();
});

(async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const anchor = document.getElementById("geo-notice-anchor");
    if (!anchor) return;

    let bannerClass = null;
    let message = null;
    let bodyClass = null;

    if (data.country_code === "IL") {
      // :contentReference[oaicite:0]{index=0}
      bannerClass = "geo-banner geo-banner--israel";
      bodyClass = "geo-israel";
      message = `
        🍉 From the river to the sea... 🍉
      `;
    }

    if (data.country_code === "RU") {
      // :contentReference[oaicite:1]{index=1}
      bannerClass = "geo-banner geo-banner--russia";
      bodyClass = "geo-russia";
      message = `
        Slava Ukraini
      `;
    }

    if (bannerClass && message) {
      // Add class to <body>
      document.body.classList.add(bodyClass);

      // Create banner
      const banner = document.createElement("div");
      banner.className = bannerClass;
      banner.innerHTML = message;

      anchor.appendChild(banner);
    }
  } catch {
    // Fail silently
  }
})();
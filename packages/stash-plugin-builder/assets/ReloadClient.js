(() => {
  let socket;

  const state = {
    connected: false,
  };

  function log(text, color) {
    const colors = {
      blue: "#61AFEF",
      green: "#59CE8F",
      red: "#D21312",
    };

    if (colors[color]) {
      console.log(`%c${text}`, `color: ${colors[color]}`);
    } else {
      console.log(text);
    }
  }

  socket = new WebSocket(`ws://${window.location.hostname}:8082`);

  socket.onerror = () => {
    log("stash-plugin-builder is not watching", "blue");
  };

  socket.addEventListener("open", () => {
    state.connected = true;
  });

  socket.addEventListener("close", () => {
    if (state.connected) {
      log("stash-plugin-builder lost connection to stash website!", "red");
      state.connected = false;
    }
  });

  socket.onmessage = (event) => {
    switch (event.data) {
      case "reload":
        window.location.reload();
        break;
      case "connected":
        log("stash-plugin-builder is watching for changes...", "green");
        break;
    }
  };
})();

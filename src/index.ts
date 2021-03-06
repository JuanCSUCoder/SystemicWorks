import Loopy from "./ts/Loopy";
import { publish, subscribe } from "./js/minpubsub";
import { toggleStylesheet, _onResize } from "./ts/Helpers";
import Key from './ts/tools/Key';
import { KeysStatus } from './ts/tools/Key';

declare global {
	interface Window {
    loopy: Loopy;
    publish: Function;
    subscribe: Function;
    Key: KeysStatus;
    HIGHLIGHT_COLOR: string;
    promptPWA(): void;
    debug_mode: boolean;
    launchQueue: {
      setConsumer(param: Function): void;
    };
	}
	
	interface Console {
		stdlog: Function;
		logs: any[];
	}
};

interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}


window.subscribe = subscribe;
window.publish = publish;

window.onload = function () {
  // If is running from an standalone window, then load directly the app
  if (window.matchMedia("(display-mode: standalone)").matches) {
    toggleStylesheet("assets/transitions.css", false);
    toggleStylesheet("assets/fs.css", true);

    let header = document.querySelector(".page-head") as HTMLElement;
    header.parentElement.removeChild(header);
  } else {
    toggleStylesheet("assets/transitions.css", true);
  }

  window.loopy = new Loopy();

  let goto_element: HTMLElement = document.getElementById("goto");
  goto_element.addEventListener("click", () => {
    toggleStylesheet("assets/fs.css");
  });

  let sidebar: HTMLElement = document.getElementById("sidebar");
  let canvas_cont: HTMLElement = document.getElementById("canvasses");

  let hide_button: HTMLElement = document.getElementById("hide-button");
  let unhide_button: HTMLElement = document.getElementById("unhide-button");

  hide_button.addEventListener("click", () => {
    sidebar.style.display = "none";
    canvas_cont.style.height = "100%";
    publish("resize");
    unhide_button.style.display = "flex";
  });

  unhide_button.addEventListener("click", () => {
    sidebar.style.display = "block";
    canvas_cont.style.removeProperty("height");
    publish("resize");
    unhide_button.style.display = "none";
  });

  let KeysController = new Key(window, window.loopy);

	let install_button = document.getElementById(
    "install_button"
	) as HTMLAnchorElement;
	
  let deferredPrompt: BeforeInstallPromptEvent;
  window.addEventListener(
    "beforeinstallprompt",
		(e: BeforeInstallPromptEvent) => {
			install_button.style.display = "flex";

      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
    }
  );
  // Show the prompt
	window.promptPWA = () => {
    try {
			deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          toggleStylesheet("assets/fs.css", true);
        }
        deferredPrompt = null;
      });
		} catch (error) {
			install_button.innerText = "Something failed. Check if it is already installed or add it manually to the home screen";
			install_button.style.display = "flex";
			install_button.style.backgroundColor = "yellow";
			install_button.style.color = "black";
			install_button.style.pointerEvents = "none";
			install_button.style.cursor = "default";
		}
  };

  document.getElementsByTagName("body")[0].style.display = "block";
	document.querySelectorAll("canvas").forEach(canvas => {
		_onResize(canvas_cont as HTMLDivElement, canvas);
	});

	// Debug Tools
	window.debug_mode = false;

	let sidebar_console = document.getElementById("debug_logs");
	let debug_toggle = document.getElementById("debug_toggle");

	console.stdlog = console.log.bind(console);
  console.logs = [];
	console.log = function () {
    console.logs.push(Array.from(arguments));
		console.stdlog.apply(console, arguments);
		
		publish("logs/update");
	};
	
	subscribe("logs/update", () => {
		let new_p = document.createElement("p");
		new_p.appendChild(
      document.createTextNode(console.logs[console.logs.length - 1] + "\n")
		);
		
		sidebar_console.appendChild(new_p);
	});

	setInterval(() => {
		sidebar_console.scrollTop = sidebar_console.scrollHeight;
	}, 100);

	debug_toggle.addEventListener("change", (ev: InputEvent) => {
		window.debug_mode = (ev.currentTarget as HTMLInputElement).checked;

		if (window.debug_mode) {
			let confirmation = prompt("You are activating DEBUG MODE. Don't use this feature unless you know what you are doing. Write ACTIVATE to confirm this action");

			if (confirmation != "ACTIVATE") {
				window.debug_mode = false;
				(ev.currentTarget as HTMLInputElement).checked = false;
			}
		}

		sidebar_console.style.display = window.debug_mode ? "block" : "none";
	});

	subscribe("resize", () => {
		window.debug_mode ? console.log("Resize Event") : '';
	});

	subscribe("model/changed", () => {
		window.debug_mode ? console.log("Model Changed Event") : '';
	});

	subscribe("model/reset", () => {
		window.debug_mode ? console.log("Model Reset Event") : '';
	});

	subscribe("canvas/moved", () => {
		if (window.debug_mode) {
			console.log("Canvas Moved Event ----");
			console.log("OffsetX: " + window.loopy.offsetX);
			console.log("OffsetY: " + window.loopy.offsetY);
			console.log("Scale: " + window.loopy.offsetScale);
		}
	});
};
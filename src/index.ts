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

  let deferredPrompt: BeforeInstallPromptEvent;
  window.addEventListener(
    "beforeinstallprompt",
    (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
    }
  );
  // Show the prompt
  window.promptPWA = () => {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        toggleStylesheet("assets/fs.css", true);
      }
      deferredPrompt = null;
    });
  };

  document.getElementsByTagName("body")[0].style.display = "block";
	document.querySelectorAll("canvas").forEach(canvas => {
		_onResize(canvas_cont as HTMLDivElement, canvas);
	});
};
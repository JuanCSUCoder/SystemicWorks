import { publish } from "../../js/minpubsub";
import Loopy from "../Loopy";

type KeyCodes = {
	[key: string]: string
};

export type KeysStatus = {
	[code: string]: boolean
};

export default class Key {
  key_codes: KeyCodes;

	constructor(win: Window, loopy: Loopy) {
		win.Key = {};

    this.key_codes = {
      Enter: "enter", // enter
      Alt: "alt", // Alt
      Shift: "shift", // Shift
      Control: "control", // Shift

      // TODO: Standardize the NAMING across files?!?!
      n: "ink", // Pe(n)cil
      v: "drag", // Mo(v)e
      e: "erase", // (E)rase
      t: "label", // (T)ext
      s: "save", // (S)ave
      p: "pan", // (P)an
      l: "loop", // (L)oop
    };

    win.addEventListener(
      "keydown",
      (e) => {
				if (!(loopy && loopy.modal && loopy.modal.isShowing)) {
					console.log(e.key);
          let code = this.key_codes[e.key];

          win.Key[code] = true;

          publish("key/" + code);
        }
      },
      false
    );

    win.addEventListener(
      "keyup",
      (e) => {
        if (!(loopy && loopy.modal && loopy.modal.isShowing)) {
          let code = this.key_codes[e.key];

          win.Key[code] = false;

          e.stopPropagation();
          e.preventDefault();
        }
      },
      false
    );
  }
}
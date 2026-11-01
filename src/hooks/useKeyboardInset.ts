"use client";

import { useEffect } from "react";

const MIN_KEYBOARD_HEIGHT = 60;

export function useKeyboardInset() {
	useEffect(() => {
		const vv = window.visualViewport;
		if (!vv) return;

		const root = document.documentElement;

		const update = () => {
			// clientHeight is the layout viewport, which the keyboard does not
			// resize on iOS; vv.height is what is actually left visible.
			const hidden = root.clientHeight - vv.height - vv.offsetTop;
			const inset = hidden > MIN_KEYBOARD_HEIGHT ? Math.round(hidden) : 0;

			root.style.setProperty("--keyboard-inset", `${inset}px`);

			// iOS scrolls the document to reveal the focused field. The layout has
			// already made room, so undo it to keep both viewports aligned.
			if (inset > 0 && window.scrollY !== 0) window.scrollTo(0, 0);
		};

		vv.addEventListener("resize", update);
		vv.addEventListener("scroll", update);
		update();

		return () => {
			vv.removeEventListener("resize", update);
			vv.removeEventListener("scroll", update);
			root.style.removeProperty("--keyboard-inset");
		};
	}, []);
}


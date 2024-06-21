import { assemble, disassemble } from "hangul-js";
import { hangeulToHanja } from "./hangeulToHanja";

function skipIfUnchanged<T extends any[], V>(
  func: (...args: T) => V,
  changed: (value: V) => void
) {
  var previous: V;
  return (...args: T) => {
    var returnValue = func.apply(null, args);
    if (returnValue !== previous) {
      changed(returnValue);
      previous = returnValue;
    }
    return returnValue;
  };
}

window.setTimeout(function () {
  var banner = document.querySelector("h1+ul")!;

  var hanja = document.createElement("div");
  hanja.id = "hanjaBar";

  let parent = banner.parentNode!;
  parent.removeChild(banner.previousSibling!);
  parent.insertBefore(hanja, banner);
  parent.removeChild(banner);

  var sourceLanguageSelector = document.getElementById("ddSourceLanguage")!;
  parent = sourceLanguageSelector.parentNode!.parentNode!;

  var enable = document.createElement("input");
  enable.type = "checkbox";
  enable.checked = true;
  enable.title = "convert all into 한글";
  enable.id = "convert";
  parent.appendChild(enable);

  function isKorean() {
    return (
      sourceLanguageSelector.getAttribute("data") == "ko" && enable.checked
    );
  }

  var backspace = document.createElement("input");
  backspace.type = "checkbox";
  backspace.checked = true;
  backspace.title = "backspace behaviour";
  backspace.id = "backspace";
  parent.appendChild(backspace);

  var input =
    document.querySelector<HTMLTextAreaElement>("textarea#txtSource")!;

  var hangul = disassemble(
    "ㅂㅈㄷㄱ쇼ㅕㅑㅐㅔㅁㄴㅇㄹ호ㅓㅏㅣㅋㅌㅊ퓨ㅜㅡㅃㅉㄸㄲㅆㅒㅖ"
  );

  var transcode = {} as Record<string, string>;

  function layout(s: string) {
    [...s].forEach(
      (c, i) => (transcode[c] = transcode[c.toUpperCase()] = hangul[i])
    );
  }

  layout("qwertyuiopasdfghjklzxcvbnmQWERTOP"); // latin
  layout("йцукенгшщзфывапролдячсмитьЙЦУКЕЩЗ"); // russian

  function selectedOutputHanja(text: string, start: number, end: number) {
    if (start == end) {
      if (start == 0) return text.substring(0, 1);
      return text.substring(start - 1, end);
    }
    return text.substring(start, end);
  }

  let timeout: Timer;

  function setTooltip(el: HTMLElement, t: string) {
    var rect = el.getBoundingClientRect();

    var tooltip = document.createElement("iframe");
    tooltip.id = "tooltip";
    tooltip.style.cssText = `left:${rect.left}px;top:${rect.bottom - 10}px;`;
    tooltip.src = t ? "https://koreanhanja.app/" + t : "about:blank";
    el.appendChild(tooltip);
    clearTimeout(timeout);
  }

  function enter(e: MouseEvent) {
    const el = e.target as HTMLElement;
    timeout = setTimeout(() => setTooltip(el, el.innerText), 700);
  }

  function leave(e: MouseEvent) {
    clearTimeout(timeout);
    const el = e.target as HTMLElement;
    var iframe = el.querySelector("iframe");
    if (iframe) el.removeChild(iframe);
  }

  var selectHanja = skipIfUnchanged(selectedOutputHanja, (symbol) => {
    if (!isKorean()) return;
    hanja.innerText = "";
    var line = symbol + " " + (hangeulToHanja[symbol] || "");
    var i = -1;
    while (line[++i]) {
      var span = document.createElement("span");
      span.innerText = line[i];
      span.style.position = "relative";
      hanja.appendChild(span);
      if (line[i] != " ") {
        span.addEventListener("mouseenter", enter);
        span.addEventListener("mouseleave", leave);
      }
    }
  });

  //   input.addEventListener("selectionchange", () =>
  //     selectHanja(input.value, input.selectionStart!, input.selectionEnd!)
  //   );

  function rerender() {
    if (!isKorean()) return;
    selectHanja(input.value, input.selectionStart, input.selectionEnd);
  }

  window.setInterval(rerender, 50);

  input.addEventListener("keydown", (e) => {
    if (!isKorean() || e.ctrlKey || e.altKey) return;

    var isTranscode = transcode[e.key];
    var isBackspace = backspace.checked && e.key == "Backspace";

    if (isBackspace || isTranscode) {
      e.preventDefault();

      var [start, end, initialLen] = [
        input.selectionStart!,
        input.selectionEnd!,
        input.value.length,
      ];

      var s = input.value;
      var before = s.substring(0, start - 1);

      var rest = s.substring(end);
      var dis = start ? disassemble(s.substr(start - 1, 1)) : [];

      if (start != end) dis = dis.slice(0, 1);
      else if (isBackspace) dis.pop();
      if (isTranscode) dis.push(isTranscode);

      var h = (input.value = before + assemble(dis) + rest);

      var evObj = document.createEvent("HTMLEvents");
      evObj.initEvent("change", true, false);
      input.dispatchEvent(evObj);

      var delta = initialLen - h.length;
      input.setSelectionRange(end - delta, end - delta);
    }
  });
}, 500);

# "Enhanced" Papago

Depending on how many languages you have installed on your system constantly switching between them just to type in that one Korean word you want to look up on [Papago](https://papago.naver.com) can be frustrating. So i wrote a [script](papago.user.js?raw=true) that forces Papago input field to treat all keyboard input as if you're in Hangeul mode. For example, if you type "dkssud" it will turn into 안녕 as you type it. It converts both English and Russian keyboard presses so i don't have to think about which language i am currently in.

Additionally this script also changes "Backspace" behaviour i find counter-intuitive -- standard Windows Korean layout deletes the entire block if you press "Backspace". My script only deletes the last entered letter. You can disable this behaviour by unchecking one of the checkboxes on top of the field. The other checkbox disables the script -- you can uncheck it to input an English word inside your Korean phrase. Obviously, script only works if source language has been set as "Korean".

I also added a Hanja refernce bar of sorts -- it replaces Papago logo on top (sorry, Naver!). It shows the syllable your cursor is on and all Hanja characters that are spelled as this syllable. If you hover mouse over any of the characters -- it pulls https://koreanhanja.app to show information about the character:

![screenshot of Papaga with Hanja reference bar](asset/papago%20hanjabar.jpg)

## Building

Extension is built with [Bun](https://bun.sh). After cloning repository, install dependencies:

```bash
bun install
```

and build unpacked extension:

```bash
bun run cfg/build.ts
```

You can then add directory "public" from that repository to your extensions in Chrome's Developer mode with "Load unpacked" button.
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ \"./src/utils.js\");\n// explictly import only the functions we are interested in\n\n // OR give all of the exported `utils` functions a namespace\n\nlet temp = \"main.js temp value\"; // does not conflict with `temp` in utils.js\n\nconst input = document.querySelector(\"#input-firstname\");\nconst output = document.querySelector(\"#output\");\nconst cbForcefully = document.querySelector(\"#cb-forcefully\");\n\nconst helloButton = document.querySelector(\"#btn-hello\");\nconst goodbyeButton = document.querySelector(\"#btn-goodbye\");\n\nlet forcefully = cbForcefully.checked;\n\n//cbForcefully.onchange = () => forcefully = cbForcefully.checked;\ncbForcefully.onchange = e => forcefully = e.target.checked;\nhelloButton.onclick = () => output.innerHTML = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.formatGreeting)(\"Hello\",input.value.trim(),forcefully);\ngoodbyeButton.onclick = () => output.innerHTML = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.formatGreeting)(\"Goodbye\",input.value.trim(),forcefully);\n\nconsole.log(\"formatGreeting('Hey There') = \", (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.formatGreeting)('Hey there'));\nconsole.log(\"doubleIt(10) = \", (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.doubleIt)(10));\nconsole.log(\"defaultName = \", _utils_js__WEBPACK_IMPORTED_MODULE_0__.defaultName); // FAILS - we need to import it\nconsole.log(\"meaningOfLife = \", _utils_js__WEBPACK_IMPORTED_MODULE_0__.meaningOfLife); // FAILS - it is not being exported by utils.js\n\nconsole.log(\"temp = \", temp);\nconsole.log(\"utils.temp = \", _utils_js__WEBPACK_IMPORTED_MODULE_0__.temp); // named import\n\n\n//# sourceURL=webpack://greeter-modules/./src/main.js?");

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"defaultName\": () => (/* binding */ defaultName),\n/* harmony export */   \"doubleIt\": () => (/* binding */ doubleIt),\n/* harmony export */   \"formatGreeting\": () => (/* binding */ formatGreeting),\n/* harmony export */   \"meaningOfLife\": () => (/* binding */ meaningOfLife),\n/* harmony export */   \"temp\": () => (/* binding */ temp)\n/* harmony export */ });\nconst meaningOfLife = 42;\nconst defaultName = \"Mr. X\";\nlet temp = \"utils.js temp value\"; // does not conflict with `temp` in main.js\n\nconst doubleIt = val =>  val * 2;\n\nconst formatGreeting = (greeting, name, forcefully) => {\n  const recipient  = name ? name : defaultName;\n  const str = `${greeting} ${recipient}`;\n  return forcefully ? `${str.toUpperCase()}!` : str;\n};\n\n// export our \"public\" symbols, everything else in this file is \"private\" by default\n\n\n\n//# sourceURL=webpack://greeter-modules/./src/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.js");
/******/ 	
/******/ })()
;
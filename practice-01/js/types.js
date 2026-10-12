"use strict";

// Для каждого выражения выводим значение и тип результата.

const concatResult = "8" + 2;
console.log('1) "8" + 2 =', concatResult, "| тип:", typeof concatResult);

const minusResult = "8" - 2;
console.log('2) "8" - 2 =', minusResult, "| тип:", typeof minusResult);

const numberPlusResult = Number("8") + 2;
console.log('3) Number("8") + 2 =', numberPlusResult, "| тип:", typeof numberPlusResult);

const stringCompareResult = "12" > "3";
console.log('4) "12" > "3" =', stringCompareResult, "| тип:", typeof stringCompareResult);

const strictEqualResult = 12 === "12";
console.log('5) 12 === "12" =', strictEqualResult, "| тип:", typeof strictEqualResult);

const emptyStringResult = Number("");
console.log('6) Number("") =', emptyStringResult, "| тип:", typeof emptyStringResult);

const textResult = Number("text");
console.log('7) Number("text") =', textResult, "| тип:", typeof textResult);

const booleanResult = Boolean("false");
console.log('8) Boolean("false") =', booleanResult, "| тип:", typeof booleanResult);

const typeofNullResult = typeof null;
console.log("9) typeof null =", typeofNullResult, "| тип:", typeof typeofNullResult);

const typeofNanResult = typeof NaN;
console.log("10) typeof NaN =", typeofNanResult, "| тип:", typeof typeofNanResult);

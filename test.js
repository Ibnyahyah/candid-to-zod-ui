const { IDL } = require("@dfinity/candid");
console.log(IDL.Principal ? "exists" : "undefined");

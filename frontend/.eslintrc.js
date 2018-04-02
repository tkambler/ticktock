module.exports = {
    "extends": "eslint:recommended",
    "env": {
        "browser": true,
        "es6": true,
        "commonjs": true,
        "node": true,
        "mocha": true,
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "eqeqeq": 2,
        "quotes": [1, "single"],
        "no-cond-assign": 2,
        "no-debugger": 2,
        "no-mixed-spaces-and-tabs": 2,
        "no-trailing-spaces": 2,
        "semi": 2,
        "spaced-comment": 2,
        "no-unused-vars": [2, {
            "vars": "all",
            "args": "none",
            "varsIgnorePattern": "^_",      // Anything starting with _ will be ignored
        }],
        "no-multi-spaces": 2,
        "array-bracket-spacing": 2,
        "block-spacing": 2,
        "brace-style": 2,
        "camelcase": 0,
        "comma-spacing": [2, {
            "before": false,
            "after": true,
        }],
        "comma-style": [2, "last"],
        "eol-last": 2,
        "indent": 2,
        "key-spacing": [2, {
            "beforeColon": false,
            "afterColon": true,
        }],
        "no-spaced-func": 2,
        "object-curly-spacing": [2, "always"],
        "space-before-blocks": [2, "always"],
        "space-before-function-paren": [2, "always"],
        "space-in-parens": [0, "always"],
        "space-infix-ops": [2, {"int32Hint": false}],
        "arrow-spacing": [2, {"before": true, "after": true}],
        "quote-props": [2, "always"],
        "keyword-spacing": 2
    },
};

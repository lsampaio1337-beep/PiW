import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: true,
                document: true,
                console: true,
                setTimeout: true,
                clearTimeout: true,
                Math: true,
                Object: true,
                JSON: true,
                setInterval: true,
                alert: true,
                confirm: true,
                localStorage: true,
                process: true,
                __dirname: true,
                require: true,
                module: true,
                Promise: true
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error"
        }
    }
];

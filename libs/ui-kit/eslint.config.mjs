import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

export default [
    ...nx.configs["flat/angular"],
    ...nx.configs["flat/angular-template"],
    ...baseConfig,
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}",
                        // Story and test files are DEV-only: tsconfig.lib.json
                        // excludes '**/*.stories.ts' and the spec/test-setup
                        // files, so nothing they import ends up in
                        // dist/libs/ui-kit. Without these entries the rule
                        // sees `@storybook/angular` and `jest-preset-angular`
                        // imported from the project and errors that they are
                        // missing from peerDependencies — and "fixing" that by
                        // declaring them would force every consumer of
                        // @org/ui-kit to install Storybook and Jest to satisfy
                        // peers they never execute.
                        "{projectRoot}/**/*.stories.{ts,js}",
                        "{projectRoot}/**/*.spec.ts",
                        "{projectRoot}/src/test-setup.ts",
                        "{projectRoot}/jest.config.{cts,ts,js}"
                    ],
                    // The theme files import the deep path '@org/tokens/generated/tokens'
                    // (tsconfig.base maps '@org/tokens/*' -> libs/tokens/dist/*), which the
                    // rule resolves as a file dep rather than a package one — so it reports
                    // the peerDependency as unused. It is used; keep it declared.
                    ignoredDependencies: ["@org/tokens"]
                }
            ]
        },
        languageOptions: {
            parser: await import("jsonc-eslint-parser")
        }
    },
    {
        files: [
            "**/*.ts"
        ],
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "baps",
                    style: "camelCase"
                }
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "baps",
                    style: "kebab-case"
                }
            ]
        }
    },
    {
        files: [
            "**/*.html"
        ],
        // Override or add rules here
        rules: {}
    }
];

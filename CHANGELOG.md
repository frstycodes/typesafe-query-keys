# Changelog

All notable changes to this project will be documented in this file.

# [1.1.1](https://github.com/frstycodes/typesafe-query-keys/compare/v1.1.0...v2.0.0) - (2025-11-13)

## 🐛 Bug Fixes

- **types:** Allow function type to work properly without setup ([2e00294](https://github.com/frstycodes/typesafe-query-keys/commit/2e002944b5fadbdc24cd6cb9250b88766fe2812c))

## 📝 Documentation

- **readme:** Remove CLI documentation reference ([7c2c4a1](https://github.com/frstycodes/typesafe-query-keys/commit/7c2c4a198521fa3653b681b24a155774f4a82f47))

# [1.1.0](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.5...v2.0.0) - (2025-11-05)

## 🏠 Refactor

- **types:** Update qk types to show more cleanly ([1c831f2](https://github.com/frstycodes/typesafe-query-keys/commit/1c831f24103f2a68118dc101a734766bcf883d9f))
- **config:** Refactor config schema and enforce .d.ts ([e372b70](https://github.com/frstycodes/typesafe-query-keys/commit/e372b70aec4f1b19f5320e3af812ef5dfbf3a960))
- Introduce file watcher, scanner, and generator ([a1875bc](https://github.com/frstycodes/typesafe-query-keys/commit/a1875bcc370d21c478e25b854e0f95ff6d437d48))
  - CLI no longer supports passing config and config schema has been updated

## 🐛 Bug Fixes

- **config:** Apply globbifyPatterns to exclude list ([c755113](https://github.com/frstycodes/typesafe-query-keys/commit/c75511367ec066a616c2b07a3cf1557b1533156a))
- **runtime:** Trim segments and params in pathToQueryKey ([6ff833e](https://github.com/frstycodes/typesafe-query-keys/commit/6ff833e0c7091afc3921d56316bf670284f267c2))
- **test:** Fix broken test ([d6c03d2](https://github.com/frstycodes/typesafe-query-keys/commit/d6c03d26bfd2eefe3cc1ef3602d60fb78c423d1c))

## 📝 Documentation

- Update docs for new changes ([9e43a1c](https://github.com/frstycodes/typesafe-query-keys/commit/9e43a1c2dac2425ddd5939858887ef9cde812830))

## 🚀 Features

- **plugin:** Add new plugins ([30ad731](https://github.com/frstycodes/typesafe-query-keys/commit/30ad731ac73e8c2b0565bee4a12d902477e6c3b4))
  - plugins now have different entrypoints

## 🧪 Testing

- **config:** Update tests ([d8ef0ac](https://github.com/frstycodes/typesafe-query-keys/commit/d8ef0ac6cc3c7ab2b304e8c6462b8923c1174690))
- **test:** Updated tests for new architecture ([d58c3e8](https://github.com/frstycodes/typesafe-query-keys/commit/d58c3e856032762c8df1ed79de28ed8f5eeae4eb))

# [1.0.5](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.4...v1.0.5) - (2025-08-30)

## 🏠 Refactor

- **codegen:** Remove unused import ([e1c0cbd](https://github.com/frstycodes/typesafe-query-keys/commit/e1c0cbd4197ce1a4b8ca460b909269872f8d3a23))

## 🧪 Testing

- **codegen:** Update tests for new array style query key patterns ([550a71f](https://github.com/frstycodes/typesafe-query-keys/commit/550a71f97cdb8ae1a3636e2e86a6edb58f91973c))

## 🪞 Styling

- **codegen:** Use array to store registered query key patterns ([9c36c9f](https://github.com/frstycodes/typesafe-query-keys/commit/9c36c9f9a027ba0bbe96ead8d6d8166df8ef08ce))

# [1.0.4](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.3...v1.0.4) - (2025-08-19)

## 🐛 Bug Fixes

- Fix CLI config filtering to exclude undefined values ([d63c9a0](https://github.com/frstycodes/typesafe-query-keys/commit/d63c9a0a1e42198276879764fb385bb61e927e26))

# Changelog

All notable changes to this project will be documented in this file.

# [1.0.3](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.2...v1.0.3) - (2025-08-19)

# Changelog

All notable changes to this project will be documented in this file.

# [1.0.2](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.1...v1.0.2) - (2025-08-19)

# Changelog

All notable changes to this project will be documented in this file.

# [1.0.1](https://github.com/frstycodes/typesafe-query-keys/compare/v1.0.0...v1.0.1) - (2025-08-19)

# Changelog

All notable changes to this project will be documented in this file.

# [1.0.0](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.7...v1.0.0) - (2025-08-19)

## 📝 Documentation

- **cli:** Update READMEs for the new CLI changes and fix some mistakes ([a9a78a2](https://github.com/frstycodes/typesafe-query-keys/commit/a9a78a2aecb1729fe78e50852688713a1e5db9d6))

## 🚀 Features

- **cli:** Allow passing config through cli tool ([6b81259](https://github.com/frstycodes/typesafe-query-keys/commit/6b81259bea6a64e36d073245821722bdc122e97b))
  - 💥 **BREAKING CHANGE:** CLI tool has been renamed from "typesafe-query-keys-cli" -> "typesafe-query-keys"

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.7](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.6...v0.1.7) - (2025-08-19)

## 🧪 Testing

- **integration:** Fix config.include expectations ([304d7d1](https://github.com/frstycodes/typesafe-query-keys/commit/304d7d1f045028938f08d2b8102fd08be17e3b90))

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.6](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.5...v0.1.6) - (2025-08-19)

## 🏠 Refactor

- **packages:** Remove unused packages and add globifyGitIgnore ([564df42](https://github.com/frstycodes/typesafe-query-keys/commit/564df429f77614262b17dc8ebb154c8cf85a579b))
- **tests:** Remove redundant unit tests, add practical usage cases ([3a766a0](https://github.com/frstycodes/typesafe-query-keys/commit/3a766a0f704b14ba3e7734889d0a97eece51a856))

## 🐛 Bug Fixes

- **config:** Normalize include/exclude patterns with globifyGitIgnore ([e910da8](https://github.com/frstycodes/typesafe-query-keys/commit/e910da866f3d77a7cc7b3b8c90d30e6e9e692fb2))

## 📝 Documentation

- **config:** Update config.include js docs ([fd061c1](https://github.com/frstycodes/typesafe-query-keys/commit/fd061c14f02be1df9638f96a563a7bc18505abd2))

## 🧪 Testing

- **example:** Add an example react project to test out the library ([2bd0988](https://github.com/frstycodes/typesafe-query-keys/commit/2bd0988c5e8428b210d6918aacebf800d08cb2d3))

## 🪞 Styling

- Formatting changes ([25f982a](https://github.com/frstycodes/typesafe-query-keys/commit/25f982a1d084127f899a2675b8858ba2256c85f5))

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.5](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.4...v0.1.5) - (2025-08-16)

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.4](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.3...v0.1.4) - (2025-08-16)

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.3](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.2...v0.1.3) - (2025-08-16)

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.2](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.1...v0.1.2) - (2025-08-16)

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.1](https://github.com/frstycodes/typesafe-query-keys/compare/v0.1.0...v0.1.1) - (2025-08-16)

# Changelog

All notable changes to this project will be documented in this file.

# [0.1.0](https://github.com/frstycodes/typesafe-query-keys/tree/v0.1.0) - (2025-08-16)

## 🚀 Features

- ***:** Project Init ([b892cc5](https://github.com/frstycodes/typesafe-query-keys/commit/b892cc5b4c9054e2b9f88bba5a6a9a1b3240030b))

# Changelog

All notable changes to this project will be documented in this file.

# [0.3.0](https://github.com/frstycodes/typesafe-query-keys/tree/v0.3.0) - (2025-08-16)

## 🚀 Features

- Initial setup ([ea7a932](https://github.com/frstycodes/typesafe-query-keys/commit/ea7a932a0ece623d9a20c4254077e521f2432681))

# Changelog

All notable changes to this project will be documented in this file.

# [0.2.0](https://github.com/frstycodes/typesafe-query-keys/tree/v0.2.0) - (2025-08-16)

## 📝 Documentation

- Improve docs ([0058ca9](https://github.com/frstycodes/typesafe-query-keys/commit/0058ca9b2e7fe7f7ae3873b8ed83ef7326a4bc86))

## 🚀 Features

- Initial setup ([43da26d](https://github.com/frstycodes/typesafe-query-keys/commit/43da26d11177b4d6bb5536042f4f27f22022f547))

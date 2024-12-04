# [2.2.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.1.3...v2.2.0) (2024-12-04)


### Bug Fixes

* determine ranges for line meta recomputation on update ([8503dbd](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/8503dbd475c44180cff13bb773bc44b380199f62))
* sorting for inner blocks without  trailing newline ([e27f20f](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/e27f20fdf7a087ebec097c86a705ad7308b69dc7))


### Features

* add command for sorting inner blocks only ([462fd5f](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/462fd5f007468b899526acb6ea4371d379c196b6))
* add skipParents parameter to [@blocksort](https://github.com/blocksort) marker ([11969e3](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/11969e30d845adfcc5f2a5bb2c0242f159f8dd23))

## [2.1.3](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.1.2...v2.1.3) (2024-12-03)


### Bug Fixes

* globally support '#' comments ([39c5deb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/39c5debf54115d9c90aea8e46ca4e42c0a9365b0))
* resolve multi-line code lenses ([744b8a2](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/744b8a2c6fa86354c7b612607b5856dacedd51c1))

## [2.1.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.1.1...v2.1.2) (2024-09-04)


### Bug Fixes

* add support block separator of outer block (`;`) ([6bafbae](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/6bafbaeadc77404442495e7c7ccd453d3b788f07))
* check for folding when sorting inner blocks ([0281d86](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0281d86b3d7756ce50c9e475f64c7c244e5fe237))

## [2.1.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.1.0...v2.1.1) (2024-08-05)


### Bug Fixes

* massively increase regexp efficiency ([26865d2](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/26865d2662f2e3c821be8f8c3e3e34a2ff561a7b))

# [2.1.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.0.2...v2.1.0) (2024-03-30)


### Features

* add option to ignore characters when sorting ([47ee322](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/47ee32210f3da38d12ee14171102076327a8ad49))

## [2.0.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.0.1...v2.0.2) (2024-03-29)


### Bug Fixes

* apply customSortOrder for non-exhaustive orders ([396c549](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/396c549052824448eb056a3e678ec08aa42a99dd))

## [2.0.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v2.0.0...v2.0.1) (2024-01-13)


### Bug Fixes

* temporarily hide deprecation notice ([0e6c717](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0e6c717060b2a5eaff4356a35c4add625d7f555c))

# [2.0.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.5...v2.0.0) (2024-01-12)


### Bug Fixes

* correctly expand selections containing arrow functions ([423a3f6](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/423a3f6a994acbbe6974f8ab111edf3dde2a2081))


### Features

* add custom sort order ([e4ce07c](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/e4ce07caf25d1838efbb9cbde16fe65fdb5011a6))


### BREAKING CHANGES

* naturalSort has been replaced by collationOptions

## [1.2.5](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.4...v1.2.5) (2023-07-10)


### Bug Fixes

* align sorting behavior to inbuilt "Sort Lines" ([76449af](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/76449af38698ca5012ab47c762491db7766a04c2))
* only provide code actions inside blocksort ranges ([1a1d314](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/1a1d314039b62e6ebb1046d6482fe295f4bbc53d))

## [1.2.4](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.3...v1.2.4) (2023-04-05)


### Bug Fixes

* correctly merged pre computed ranges ([faae311](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/faae3111a75aeb03043a13eff1bea5b4c26752b2))
* remove all computed ranges on document update ([9e70a7d](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/9e70a7dc91e0c7e9dbc54c0170d8a8586dff4460))

## [1.2.3](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.2...v1.2.3) (2023-02-15)


### Bug Fixes

* deploy to OpenVSX ([fd6e60a](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/fd6e60affaeaea4c5951318584eabe331ee5a557))

## [1.2.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.1...v1.2.2) (2022-12-04)


### Performance Improvements

* cache line meta while document is open across all providers ([c965373](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/c96537343681a112a63d5100caa538d429e72876))

## [1.2.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.2.0...v1.2.1) (2022-12-01)


### Bug Fixes

* fix comment detection for python and ruby ([d770838](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/d770838b7e5aedf2bd091d5b8d7c4bce68ac0d6a))

# [1.2.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.1.1...v1.2.0) (2022-08-29)


### Features

* add options for expanding the current selection ([af60598](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/af60598c84814db050cb08a37a5a44a94b1fb317))
* additional options for expanding single cursors ([d4964a0](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/d4964a0c772b0df52529f4d293d213b940691502))
* allow more control over the selection expansion ([4ec08eb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/4ec08eb604efdedc960964c83d847d80b5e10a26))

## [1.1.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.1.0...v1.1.1) (2022-08-24)


### Bug Fixes

* expand selection over newlines in indented block ([4c19233](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/4c192334f53837d4f451d32bce0bb6ccd9127c30))

# [1.1.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v1.0.0...v1.1.0) (2022-08-23)


### Features

* add  local and full selection expansion modes ([bbb8b1f](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/bbb8b1fa7447a77a62d32e72bf31b4408a8f7f9c))
* add commands for selection expansion ([579d8b9](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/579d8b93ea2ba7713c4fea3713b8486f1456a59d))

# [1.0.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.10.0...v1.0.0) (2022-08-22)


### Bug Fixes

* expand auto selection into white spaces ([fde1904](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/fde19040d1dbb850f9e324ac73a13c592e82fef7))


### Features

* keep appended newlines in-place when sorting ([312229b](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/312229b894df62f4939d59ba1c9f40783bc9311b))


### BREAKING CHANGES

* Selection now expands both ways until hitting the surrounding block margins

# [0.10.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.9.0...v0.10.0) (2022-08-11)


### Bug Fixes

* allow ignoring folding markers ([40b1305](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/40b1305db79a5af6f03c040acdc0bf195fc4d517))
* avoid catastrphic regex backtracking ([b43933c](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/b43933c1e3f9192cefddc41041a86fc17961af15))
* duplicate provideDocumentFormattingEdits compatibility for compatibility ([7494262](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/7494262e6402964c3dcfc1e4ada3711ba3797f53))
* trim empty lines from block selection ([e46a924](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/e46a9246a2c52ffaa53093e023e0f5481b4e8c76))


### Features

* make  formatting and code actions configurable ([197963f](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/197963fdcaff8dfd9353f40fc240905e602b2815))
* make block regexes configurable ([9de1919](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/9de191964b420057011b05a57e255bb03e743311))


### Performance Improvements

* cache configuration for each document ([934bf76](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/934bf76a51ae81ccd6e1397aa78676aa467da199))

# [0.9.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.8.4...v0.9.0) (2022-08-05)


### Bug Fixes

* support self closing / void xml tags ([ab5ca38](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/ab5ca38ef6dc4b62f846eedbe30069e5756019d4))


### Features

* add language support for extension settings ([505c4b4](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/505c4b4face5ffb20c170960b288b8b14ce6bb76))

## [0.8.4](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.8.3...v0.8.4) (2022-08-05)


### Bug Fixes

* allow overriding folding markers ([960f711](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/960f711c9bfb011f1c2e76678e76f233a512101c))

## [0.8.3](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.8.2...v0.8.3) (2022-06-20)


### Bug Fixes

* upgrade dependencies ([7ff51a8](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/7ff51a844b20edf3671091c956726a938d65e803))

# Changelog

## [0.8.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.8.0...v0.8.1) (2022-05-12)


### Bug Fixes

* correctly sort nested [@blocksort](https://github.com/blocksort) markers ([606beae](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/606beae162150762560f6101acec24d45efa8d77))
* correctly update blocksort code lenses ([b61a8ba](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/b61a8ba8ee1eced6311924a1eba1aa14c712a924))


# [0.8.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.7.3...v0.8.0) (2022-04-05)


### Bug Fixes

* implement CancellationToken over full sorting process ([38fe3f8](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/38fe3f87b1db8ca47da380383d763fa26dba4bb6))

### Features

* vastly improve performance with line caching ([2affb0c](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/2affb0cbb60967926c6431614819b6b39d79f096))

### Performance Improvements

* prevent getting text multiple times ([20ce02a](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/20ce02af43a5a98015659907a418fd0020b7b9a2))


## [0.7.3](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.7.2...v0.7.3) (2022-01-24)


### Bug Fixes

* upgrade dependencies ([f7ffda0](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/f7ffda0599ab78dcb998083ceb46b87118efefcc))

## [0.7.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.7.1...v0.7.2) (2021-12-16)


### Bug Fixes

* back revert engine change ([ed4eec5](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/ed4eec55986f300af51828bc729e0b65f3caae50))
* bug multilevel sorting working for unbalanced objects ([5c7a9bb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/5c7a9bbd27b4f3889d7de50634dfd7e04017bc62))
* white_check_mark provide correct code action kinds ([6de6de7](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/6de6de7b485a9dd20cb014142d849e05d196b194))
* annotation: white_check_mark allow inifinite depth ([2b63574](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/2b635745869597148392d33a8379a63f242b6632))
* commands: bug fix error on multilevel sorting ([e9deedb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/e9deedb60cd06daafc46946eecadeeb80330ee6b))
* dont auto sort markers with invalid positions ([7695c3d](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/7695c3d6b1f963bc3864bacb5834b24a71347d88))


## [0.7.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.7.0...v0.7.1) (2021-12-14)


### Bug Fixes

* apply blocksort code lens for correct range ([f15532f](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/f15532fb8b44391bd73320685f818ad65a22fa05))
* fix caching for blocksortcode actions ([5f4a891](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/5f4a891bbe1bb9331823d80120de45054cd17b4e))
* make code lenses optional ([20e23c7](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/20e23c7fd279fbdd5ce237d937947908c0b7aa0e))
* use natural sorting settings for formatting and code actions ([680501a](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/680501a5718a88e3022a6b44ae8009bd25f37b93))


# [0.7.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.6.2...v0.7.0) (2021-12-13)


### Features

* activate extension after startup to enable new features ([edb05a5](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/edb05a50a1a1a79825b4f5ad157b30ed6927d0ba))
* add code actions, lenses and formatting ([dcf9cda](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/dcf9cdab82253198d26d152664675a23093ff152))
* migrate to new formatting provider ([ae6254b](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/ae6254bca6f0041871121ce65512af15c28e1f78))


## [0.6.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.6.1...v0.6.2) (2021-07-09)


### Bug Fixes

* fix infinite call stack depth on multilevel sort ([c1f5e29](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/c1f5e295c07c3fd7341a599f0654e0fcdca08999))
* force last block now working as intended ([18de840](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/18de840106ee104d4e57181519d9b305e775d8c4))

## [0.6.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.6.0...v0.6.1) (2021-06-14)


### Bug Fixes

* update documentation ([d30f207](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/d30f20774c8e763270e247ff18f330af99ec152f))


# [0.6.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.5.1...v0.6.0) (2021-06-14)


### Features

* contribute configuration for natural sorting ([0b61216](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0b6121654e55c25138d7588ea941e7caad5eba7e))
* natural sorting of lines containing numbers ([d04a963](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/d04a96314914cda5ab2c79b2b4e33517a6be439c))
* support natural sorting for negative numbers ([a2bf771](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/a2bf7715327948e31e88c03dc96c7e0f81176ad3))


## [0.5.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.5.0...v0.5.1) (2021-06-08)


### Bug Fixes

* fix dist folder ([fb7f44a](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/fb7f44a1615e1552c9207d00bee1c9bba1b96819))


# [0.5.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.4.0...v0.5.0) (2021-06-08)


### Features

* add suport for multilevel sorting ([789405a](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/789405a9385f88a0a5a1fe2a11ee28b4d07a35f2))
* dialog for setting level for multilevel sort ([aedf3e6](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/aedf3e6d9561533191f9e0a5f5966a69c9ee2597))
* options for multilevel sort ([b55b7f4](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/b55b7f413ce5595649e243f3fd90548ee7e05c61))
* provide commands for multilevel sort ([9a856ba](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/9a856ba5045dbf59a77bdf61200095c6ff66449d))


# [0.4.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.3.0...v0.4.0) (2021-05-06)


### Features

* always put else / delete option last ([0a539c5](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0a539c5210099042c56909c1cc99157035e95ba5))
* configuration settings for block header sorting ([bf5ef4c](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/bf5ef4c2610570dbef240cfb69fcd8bc726de3d5))
* sort block headers ([4c3fba5](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/4c3fba5d45dcaff15710ccbba2d1b072c1345ae0))
* sticky block headers (case expressions) ([0bed7eb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0bed7ebe8b287e8704cc4683dcfdeff97ce9ceb0))


# [0.3.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.2.1...v0.3.0) (2021-04-15)


### Bug Fixes

* fix expansion when second line is selected ([69574d8](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/69574d8403771bd622a8ed81054c7b2a5c93cb7c))
* fix newline issues on toplevel sorting ([f2b8ce1](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/f2b8ce1a52e0127a9df40d0bae7cf1d61bf14110))


### Features

* add configuration for block marker regexes ([86d0d77](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/86d0d77a876a70c1672f233b7eaafc1a9bd76bf9))
* simplify and extend folding detection ([27c4769](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/27c4769bfebf0dec658b05d7cc78ef8de2856438))


## [0.2.1](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.2.0...v0.2.1) (2021-04-02)


### Bug Fixes

* fix invalid selectionexpansion on first line ([1b60b35](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/1b60b3513199141d60f937e3d673f0f99b4da9de))
* no sorting over cpp-like visibility modifiers ([e7579a4](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/e7579a4507636ce9b8645352f678639fe7c8759c))


# [0.2.0](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.1.2...v0.2.0) (2021-04-02)


### Bug Fixes

* fix sigsev issues with vscode and electron ([29cf9cb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/29cf9cbf55af06fb99491acd961409beeb6b376e))
* remove build command from test action ([b5176a4](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/b5176a489d8379fc2797ed0ef31348d59c14c1e2))


### Features

* add actions for tests ([444c312](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/444c3125d53ec39ce32397f8c8538578b94d7130))
* add automated tests ([6f33690](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/6f336901ed9445ea73bf99213e8b33d27a13d8fb))
* add language specific comments ([59722ac](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/59722acbfaf25a6405295e40907cb0a7b845ff01))
* add language specific strings ([02dd26d](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/02dd26d52ec213f7785ca4bbb73d9d3a9c9cb81b))
* add semantic release ([c0424fb](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/c0424fb740d99d6d7c1d9d689a1951a554f9859b))
* stricky comments and newline management ([1d1cebe](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/1d1cebe9f566be9e34c0df84a13a4c861f37cc8f))
* support for xml and better block recognition ([0cab698](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/0cab6988beecf36880e77b9136818f88130dd642))


### [0.1.2](https://github.com/1nVitr0/plugin-vscode-blocksort/compare/v0.1.1...v0.1.2) (2021-03-21)


### Bug Fixes

* fix block start in next line style ([2354e32](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/2354e32ee86f3d2529e11962d6daed1e93f0477e))
* fix selections with empty lines ([d6195cd](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/d6195cdf33f159ca73647723123e27cf45f68ed1))

### 0.1.1 (2021-03-21)


### Bug Fixes

* update package information ([05993b2](https://github.com/1nVitr0/plugin-vscode-blocksort/commit/05993b202099357ba48fddd2bd32de6b0caa33fc))

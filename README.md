# Bitwise Account Manager

### Summary

[Bitwise Account Manager](https://chrome.google.com/webstore/detail/bitwise-account-manager/jabblapkdcnmghnafipabnfkhoieiage) (BAM) is an [open source](https://github.com/bitwisecc/bam) Chrome extension that digitally signs and relay API requests for [Bitwise Terminal](https://www.bitwise.cc/terminal/).
BAM encrypts API credentials on disk using industry standards (AES and PBKDF2) and safeguards them in memory so that they are **never exposed to third parties** including Bitwise Terminal.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-main-menu.png"><br/>
  Bitwise Account Manager main menu
</p>

### Installation

1. (Optional but recommended) Create a dedicated Chrome profile for BAM.
    * In Chrome, open the *People* menu and choose *Add Person*.
    * Alternatively, click the Chrome profile icon at the top right. From the drop-down menu, choose *Manage People* and click *Add Person*.
    * An isolated Chrome profile ensures that no other extension will interfere with BAM or pose a threat to the security of API trading.
2. Install [Bitwise Account Manager](https://chrome.google.com/webstore/detail/bitwise-account-manager/jabblapkdcnmghnafipabnfkhoieiage) from Chrome Web Store.
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-web-store-confirmation.png"><br/>
The wording of Chrome Web Store's confirmation message might sound confusing or even alarming, but BAM does not need to read or change data on testnet.bitmex.com or www.bitmex.com per se; it only declares these two domains in the [permissions specification](https://github.com/bitwisecc/bam/blob/master/chrome-extension/manifest.json) in order to submit API requests to BitMEX from [mux.js](https://github.com/bitwisecc/bam/blob/master/chrome-extension/mux.js).
3. Open [Bitwise Terminal](https://terminal.bitwise.cc/) to confirm that it successfully connects to BAM.
4. Click the BAM icon at the top right. Add trading APIs in the pop-up.
5. (Optional but recommended) In BAM, click *Encrypt Data*.
    * BAM uses your password to encrypt API credentials on disk.
    * If you forget the password, there is no way to recover it. You'll have to reinstall BAM and re-enter API accounts.

### Advanced installation

For those who want to audit or tinker with the source code, replace step 2 above with the following steps.

2-1. Clone the git repository from a terminal.
<pre><code>git clone https://github.com/bitwisecc/bam</code></pre>
2-2. In Chrome, open <code>chrome://extensions/</code> and turn on *Developer mode*.<br/>
2-3. Click *Load unpacked* and open the local BAM directory.<br/>
2-4. (Optional) Edit the source code if you like and reload the extension. Do not load both your cloned repository and the published extension at the same time.

### How BAM works

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-diagram.png"><br/>
  System architecture overview and data flow diagram
</p>

The diagram above depicts how data flows between system components.

On any *.bitwise.cc webpage, BAM can be activated by its icon in Chrome.
In the pop-up window, you may add, rename, or delete API keys (see ① in the diagram).

As Chrome isolates BAM's window and storage space from all websites and other extensions, sensitive API data do not leak.
For added security, BAM derives an AES key from a user-supplied password and encrypts account data on disk (②).

When (and only when) you visit a page on *.bitwise.cc (e.g. [Bitwise Terminal](https://terminal.bitwise.cc/)), BAM injects its extension ID and version number into the host page so that the two sides can communicate with each other (③).

Once a message channel is established, the host page gets a read-only view of the account list (names and API identifiers) but not any API secrets (④), without which no valid request signatures can be forged.

When you issue a command (e.g. submitting a limit order) in Bitwise Terminal (⑤), the host page delegates the API request to BAM (⑥) as Bitwise Terminal itself is incapable of signing the request to make it valid.

Having signed the API request, BAM submits it directly to BitMEX (⑦).
Upon receiving a server response from BitMEX (⑧), BAM forwards it to Bitwise Terminal (⑨) to complete the execution of your command.

During the whole session, API secrets never leave the realm of BAM.

### User manual

#### Adding accounts
Create a pair of API key and secret at
[https://www.bitmex.com/app/apiKeys](https://www.bitmex.com/app/apiKeys) (or
[https://testnet.bitmex.com/app/apiKeys](https://testnet.bitmex.com/app/apiKeys) if you're using testnet).
The default key permission grants read-only access to API keys.
Change it to "Order" if you plan to run trading commands on Bitwise Terminal.
Leave the *Withdraw* option unchecked.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bitmex-api-management.png"><br/>
  BitMEX API key management
</p>

Switch to Bitwise Terminal.
Click the BAM icon to open the pop-up window.
Click <code>[ADD ACCOUNT]</code>.
Pick either <code>bitmex</code> (default) or <code>bitmex-testnet</code>.
Give the new account a name without whitespaces.
Paste in the API key and secret and click <code>[OK]</code>.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-add-account.png"><br/>
  Add account to BAM
</p>

Note that when you switch between browser tabs, Chrome would close an extension's pop-up window.
You'll need to click the BAM icon again to bring it back.

#### Renaming an account

Click the account name in the list to rename it.

#### Deleting an account

Click the <code>[x]</code> button next to an account to delete it.

#### Encrypting data

Encryption is optional but recommended for enhanced security.
In BAM's pop-up, click <code>[ENCRYPT DATA]</code>.
Type a password twice and click <code>[OK]</code>.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-encrypt-data.png"><br/>
  Encrypt data in BAM
</p>

When BAM starts next time or you click <code>[LOCK DATA]</code>,
you'll be prompted for the password to unlock data.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-unlock-data.png"><br/>
  Unlock data in BAM
</p>

If you forget the password, there's no way to recover it.
You'll have to reinstall BAM and re-populate API accounts.

#### Exporting data

To make a data backup, click <code>[EXPORT DATA]</code>.
It's recommended that you encrypt the data first.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-export-data.png"><br/>
  Export data from BAM
</p>

#### Importing data

To restore from a backup, click <code>[IMPORT DATA]</code>.
Paste in the encoded data.
If encrypted, also enter the password.
Click <code>[OK]</code> to confirm.
Be cautious that this will overwrite your current account data.

<p align="center">
  <img src="https://github.com/bitwisecc/bam/raw/master/images/bam-import-data.png"><br/>
  Import data into BAM
</p>

### License and code contribution

BAM's [full source code](https://github.com/bitwisecc/bam) is released under the very permissive MIT license.

For better security and performance, no externally hosted resources are loaded at runtime.
The only code dependency — [MithrilJS v1.1.6](https://github.com/MithrilJS/mithril.js/releases/download/v1.1.6/mithril.min.js) — is bundled with the extension.
MithrilJS is also open-source and [MIT-licensed](https://github.com/MithrilJS/mithril.js/blob/next/LICENSE).

Bug reports or fixes are always welcome on Github.
However, please refrain from sending pull requests with substantial changes or new dependencies
unless they are security enhancements.
We'd like to keep the repository lean to facilitate code auditing and modding.

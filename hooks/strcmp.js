'use strict';

console.log("[*] Ultimate Frida hook loaded");

let capturedPasswords = [];

function setupHooks() {
    console.log("[+] Setting up hooks...");

    const libc = Process.getModuleByName("libc.so.6");
    if (!libc) {
        console.log("[-] libc not found");
        return;
    }

    // NAPPAA SYÖTTEET
    const scanfPtr = libc.findExportByName("__isoc99_scanf") ||
                     libc.findExportByName("scanf");

    if (scanfPtr) {
        console.log(`[+] Hooking scanf at ${scanfPtr}`);

        Interceptor.attach(scanfPtr, {
            onEnter: function(args) {
                try {
                    const format = Memory.readUtf8String(args[0]);
                    console.log(`\n[SCANF] Format: "${format}"`);

                    if (format && format.includes("%s")) {
                        this.bufferPtr = args[1];
                        console.log(`[SCANF] Will store input at: ${this.bufferPtr}`);
                    }
                } catch(e) {}
            },
            onLeave: function(retval) {
                try {
                    if (this.bufferPtr) {
                        const input = Memory.readUtf8String(this.bufferPtr);
                        console.log(`[!] USER INPUT CAPTURED: "${input}"`);

                        capturedPasswords.push(input);

                        send({
                            type: "password",
                            value: input,
                            count: capturedPasswords.length
                        });
                    }
                } catch(e) {
                    console.log(`[!] Error: ${e}`);
                }
            }
        });
    }

    // NÄE VERTAILUT
    const strcmpPtr = libc.findExportByName("strcmp");
    if (strcmpPtr) {
        console.log(`[+] Hooking strcmp at ${strcmpPtr}`);

        Interceptor.attach(strcmpPtr, {
            onEnter: function (args) {
                try {
                    if (args[0].isNull() || args[1].isNull()) return;

                    const a = Memory.readUtf8String(args[0]);
                    const b = Memory.readUtf8String(args[1]);

                    console.log(`[STRCMP] "${a}" vs "${b}"`);
                } catch (e) {
                }
            },
            onLeave: function (retval) {
                const r = retval.toInt32();
                console.log(`[STRCMP] Returns: ${r} (${r === 0 ? "EQUAL" : "DIFFERENT"})`);
            }
        });
    }

    // NÄE TULOSTUKSET (OK/NO)
    const putsPtr = libc.findExportByName("puts");
    if (putsPtr) {
        console.log(`[+] Hooking puts at ${putsPtr}`);

        Interceptor.attach(putsPtr, {
            onEnter: function(args) {
                try {
                    const message = Memory.readUtf8String(args[0]);
                    console.log(`[OUTPUT] Program says: "${message}"`);

                    if (message === "OK") {
                        console.log(`[SUCCESS] Last password was correct!`);
                        if (capturedPasswords.length > 0) {
                            console.log(`[SUCCESS] Password was: "${capturedPasswords[capturedPasswords.length-1]}"`);
                        }
                    }
                } catch(e) {}
            }
        });
    }

    // NÄE tuloste
    const printfPtr = libc.findExportByName("printf");
    if (printfPtr) {
        console.log(`[+] Hooking printf at ${printfPtr}`);

        Interceptor.attach(printfPtr, {
            onEnter: function(args) {
                try {
                    const message = Memory.readUtf8String(args[0]);
                    if (message && message.includes("Password")) {
                        console.log(`[PROMPT] Program prompts: "${message}"`);
                    }
                } catch(e) {}
            }
        });
    }

    console.log("[+] All hooks installed! Waiting for input...");
}

// Odota että target latautuu
setTimeout(setupHooks, 500);
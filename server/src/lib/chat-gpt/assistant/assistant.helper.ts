export function cleanMessage(message: string): string {
    for (let i = 0; i < 3; i++) {
        message = message.replace(/\[REFLEXION\][\s\S]*?\[REFLEXION\]/g, "");

        const parties = message.split('[CONTINUE]');

        if (parties.length === 3) {
            message = parties[0] + parties[1];
        } else if (parties.length === 2) {
            message = parties[0];
        }
        message = message.replace(/\[END\][\s\S]*$/, "");
        message = message.replace(/^[\s\S]*?\[START\]/, "");
        message = message.replace("html", "");
        message = message.replace(/```/g, "");
        message = message.trim();
        if (message !== "") {
            message = message + "\n\n";
        }
    }
   
    return message;
}
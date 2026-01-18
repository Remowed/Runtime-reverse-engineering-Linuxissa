#include <stdio.h>
#include <string.h>

int check(char *input) {
    if (strcmp(input, "letmeinplease") == 0)
        return 1;
    return 0;
}

int main() {
    char buf[64];

    while (1) {
        printf("Password: ");
        scanf("%63s", buf);

        if (check(buf)) {
            puts("OK");
            break;
        } else {
            puts("NO");
        }
    }
}
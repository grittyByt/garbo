import { API_BASE_URL } from "./api-config.js";

export interface VerificationState {
  pendingVerification?: boolean;
  locked?: boolean;
  lockedUntil?: string | null;
  attemptsRemaining?: number;
  canResend?: boolean;
  resendAvailableAt?: string | null;
}

// will keep TypeScript from treating the backend response as unknown
interface VerificationResponse {
  ok?: boolean;
  verified?: boolean;
  accountCreated?: boolean;

  error?: string;

  locked?: boolean;
  lockedUntil?: string;

  attemptsRemaining?: number;

  message?: string;
}

// The Countdown
function startVerificationLockout(
  lockedUntil: string,
  codeInput: HTMLInputElement,
  verifyButton: HTMLButtonElement,
  attemptsMessage: HTMLParagraphElement,
  countdownContainer: HTMLDivElement,
  countdownTimer: HTMLSpanElement,
  statusMessage: HTMLParagraphElement
): void {

  codeInput.disabled = true;
  verifyButton.disabled = true;

  attemptsMessage.textContent = "0 attempts remaining";

  statusMessage.textContent = "Maximum verification attempts reached.";

  countdownContainer.hidden = false;

  verifyButton.textContent = "Please Wait...";

  let countdownInterval: number | undefined;


  const updateCountdown = (): void => {

    const remainingMs =
      new Date(lockedUntil).getTime() -
      Date.now();

    if (remainingMs <= 0) {

      if (countdownInterval !== undefined) {
        clearInterval(countdownInterval);
      }

      countdownTimer.textContent = "00:00";
      codeInput.disabled = true;
      verifyButton.disabled = false;
      verifyButton.textContent = "Resend New Code";
      statusMessage.textContent = "You may now request a new verification code.";

      return;
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    countdownTimer.textContent =
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;
  };

  updateCountdown();

  /*
   * Only start an interval if the lockout
   * hasn't already expired.
   */
  if (new Date(lockedUntil).getTime() > Date.now()) {
    countdownInterval = window.setInterval(updateCountdown, 1000);
  }
}

export async function emailVerifyDisplay(state?: VerificationState): Promise<void> {

  /*
   * Prevent multiple verification modals
   * from being created.
   */
  const existingModal = document.querySelector(".email-verification-modal");

  if (existingModal) { return; }

  /*
   * Modal background overlay
   */
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("email-verification-modal");

  /*
   * Modal container
   */
  const modalContent = document.createElement("div");
  modalContent.classList.add("email-verification-content");

  /*
   * Title
   */
  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Verify Your Email";

  /*
   * Instructions
   */
  const instructions = document.createElement("p");
  instructions.classList.add("verification-instructions");
  instructions.textContent = "Enter the 6-digit verifier passcode sent to your email.";


  /*
   * Verification code input
   */
  const codeInput = document.createElement("input");

  codeInput.type = "text";
  codeInput.id = "verification-code";
  codeInput.classList.add("verification-code-input");
  codeInput.placeholder = "0 0 0 0 0 0";
  codeInput.inputMode = "numeric";
  codeInput.autocomplete = "one-time-code";
  codeInput.maxLength = 6;
  codeInput.setAttribute("aria-label", "Six digit email verification code");


  /*
   * Attempts remaining message
   */
  const attemptsMessage = document.createElement("p");
  attemptsMessage.classList.add("verification-attempts");
  attemptsMessage.textContent = "5 attempts remaining";


  /*
   * Lockout countdown
   *
   * Hidden until the backend tells us
   * that this pending signup is locked.
   */
  const countdownContainer = document.createElement("div");

  countdownContainer.classList.add("verification-countdown");

  countdownContainer.hidden = true;

  const countdownMessage = document.createElement("p");

  countdownMessage.textContent = "You can request a new code in:";

  const countdownTimer = document.createElement("span");

  countdownTimer.classList.add("verification-countdown-timer");

  countdownTimer.textContent = "00:00";

  countdownContainer.append(countdownMessage, countdownTimer);


  /*
   * Error / status message
   */
  const statusMessage = document.createElement("p");

  statusMessage.classList.add("verification-status");

  statusMessage.setAttribute("aria-live", "polite");


  /*
   * Verify / Resend button
   *
   * This same button will eventually switch:
   *
   * Verify Email
   *      ↓
   * Please Wait...
   *      ↓
   * Resend New Code
   */
  const verifyButton =
    document.createElement("button");

  verifyButton.type = "button";

  verifyButton.id = "verify-email-button";

  verifyButton.classList.add(
    "verify-email-button"
  );

  verifyButton.textContent = "Verify Email";


  /*
   * Assemble modal
   */
  modalContent.append(
    modalTitle,
    instructions,
    codeInput,
    attemptsMessage,
    countdownContainer,
    statusMessage,
    verifyButton
  );

  modalOverlay.appendChild(modalContent);

  document.body.appendChild(modalOverlay);

  if (typeof state?.attemptsRemaining === "number") {
      attemptsMessage.textContent =
        `${state.attemptsRemaining} ` +
        `attempt${ state.attemptsRemaining === 1 ? "" : "s" } remaining`;
  }

  if (state?.locked && state.lockedUntil) {
      startVerificationLockout(
        state.lockedUntil,
        codeInput,
        verifyButton,
        attemptsMessage,
        countdownContainer,
        countdownTimer,
        statusMessage
      );

      return;
  }

  if (!state?.locked && state?.attemptsRemaining === 0 && state?.canResend) {
      codeInput.disabled = true;
      countdownContainer.hidden = false;
      countdownTimer.textContent = "00:00";
      statusMessage.textContent = "You may now request a new verification code.";
      verifyButton.disabled = false;
      verifyButton.textContent = "Resend New Code";

      return;
  }

  /*
   * Automatically place the cursor
   * inside the verification input.
   */
  codeInput.focus();


  /*
   * Only allow numbers.
   */
  codeInput.addEventListener("input", () => {

    codeInput.value = codeInput.value.replace(/\D/g, "");

  });

  verifyButton.addEventListener("click", async () => {
        const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");

        if (!pendingEmail) {

          statusMessage.textContent = "Unable to locate the pending signup.";
          return;
        }


        /*
         * ==================================
         * RESEND MODE
         * ==================================
         */

        if (
          verifyButton.textContent ===
          "Resend New Code"
        ) {

          try {

            verifyButton.disabled = true;

            verifyButton.textContent =
              "Sending...";

            const response = await fetch(
              `${API_BASE_URL}/api/auth/resend-verification`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json"
                },

                body: JSON.stringify({
                  email: pendingEmail,
                  purpose: "SIGNUP"
                })
              }
            );

            const data: VerificationResponse = await response.json();


            if (!response.ok) {

              /*
               * Backend says we're somehow
               * still locked.
               */
              if (
                response.status === 429 &&
                data.lockedUntil
              ) {

                startVerificationLockout(
                  data.lockedUntil,
                  codeInput,
                  verifyButton,
                  attemptsMessage,
                  countdownContainer,
                  countdownTimer,
                  statusMessage
                );

                return;
              }

              statusMessage.textContent =
                data.error ??
                "Unable to resend verification code.";

              verifyButton.disabled = false;

              verifyButton.textContent =
                "Resend New Code";

              return;
            }


            /*
             * New code successfully sent.
             */
            codeInput.value = "";
            codeInput.disabled = false;

            attemptsMessage.textContent =
              "5 attempts remaining";

            countdownContainer.hidden = true;

            countdownTimer.textContent =
              "00:00";

            statusMessage.textContent =
              "A new verification code has been sent.";

            verifyButton.disabled = false;

            verifyButton.textContent =
              "Verify Email";

            codeInput.focus();

            return;

          } catch (error: unknown) {

            console.error(
              "Resend verification request failed:",
              error
            );

            statusMessage.textContent =
              "Unable to connect to the server.";

            verifyButton.disabled = false;

            verifyButton.textContent =
              "Resend New Code";

            return;
          }
        }


        /*
         * ==================================
         * VERIFY MODE
         * ==================================
         */

        const code =
          codeInput.value.trim();


        if (!/^\d{6}$/.test(code)) {

          statusMessage.textContent =
            "Please enter the complete 6-digit verifier passcode.";

          codeInput.focus();

          return;
        }


        try {

          /*
           * Prevent double-click submissions.
           */
          verifyButton.disabled = true;

          verifyButton.textContent =
            "Verifying...";


          const response = await fetch(
            `${API_BASE_URL}/api/auth/verify-email`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                email: pendingEmail,
                code
              })
            }
          );


          const data:
            VerificationResponse =
            await response.json();


          /*
           * ==================================
           * VERIFICATION SUCCESS
           * ==================================
           */

          if (response.ok) {

            sessionStorage.removeItem(
              "pendingVerificationEmail"
            );

            statusMessage.textContent =
              data.message ??
              "Email verified successfully.";

            /*
             * Account now exists, so don't allow
             * additional verification submissions.
             */
            codeInput.disabled = true;
            verifyButton.disabled = true;

            verifyButton.textContent =
              "Verified";

            /*
             * We can later decide whether Garbo
             * should automatically close the modal
             * and display the login screen here.
             */

            return;
          }


          /*
           * ==================================
           * LOCKOUT
           * ==================================
           */

          if (
            response.status === 429 &&
            data.locked &&
            data.lockedUntil
          ) {

            startVerificationLockout(
              data.lockedUntil,
              codeInput,
              verifyButton,
              attemptsMessage,
              countdownContainer,
              countdownTimer,
              statusMessage
            );

            return;
          }


          /*
           * ==================================
           * INCORRECT CODE
           * ==================================
           */

          if (
            typeof data.attemptsRemaining ===
            "number"
          ) {

            attemptsMessage.textContent =
              `${data.attemptsRemaining} ` +
              `attempt${
                data.attemptsRemaining === 1
                  ? ""
                  : "s"
              } remaining`;
          }


          statusMessage.textContent =
            data.error ??
            "Unable to verify the code.";

          /*
           * Let them make another attempt.
           */
          verifyButton.disabled = false;

          verifyButton.textContent =
            "Verify Email";

          codeInput.select();


        } catch (error: unknown) {

          console.error(
            "Email verification request failed:",
            error
          );

          statusMessage.textContent =
            "Unable to connect to the server. Please try again.";

          verifyButton.disabled = false;

          verifyButton.textContent =
            "Verify Email";
        }
      }
    );
}
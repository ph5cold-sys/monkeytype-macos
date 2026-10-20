import { Page } from "../../common/Page";
import { FingerPractice } from "./FingerPractice";

export function PracticePage() {
  return (
    <Page id="practice">
      <section class="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8 text-center">
        <header class="grid gap-2">
          <h1 class="text-3xl text-text">Finger practice</h1>
          <p class="text-sub">
            A separate practice session. Your typing test stays untouched. Rest
            your fingers on A S D F and J K L ;, then follow the prompts.
          </p>
        </header>
        <FingerPractice />
      </section>
    </Page>
  );
}

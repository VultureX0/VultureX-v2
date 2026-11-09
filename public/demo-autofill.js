/*
 * TEMPORARY helper for the recorded demo walkthrough.
 * Served from public/ so the browser can drive the real React forms quickly
 * while the user screen-records. Remove after the walkthrough.
 */
(function () {
  const proto = (el) =>
    el.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : el.tagName === "SELECT"
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;

  function setValue(el, v) {
    if (!el) return false;
    Object.getOwnPropertyDescriptor(proto(el), "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function clickText(root, text) {
    const btns = Array.from((root || document).querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent.trim() === text);
    if (btn) {
      btn.click();
      return true;
    }
    const partial = btns.find((b) => b.textContent.includes(text));
    if (partial) {
      partial.click();
      return true;
    }
    return false;
  }

  function field(labels) {
    const wanted = Array.isArray(labels) ? labels : [labels];
    const el = Array.from(document.querySelectorAll("label")).find((l) =>
      wanted.some((w) => l.textContent.trim().startsWith(w)),
    );
    if (!el) return null;
    const scope = el.parentElement;
    return (
      scope.querySelector("textarea") ||
      scope.querySelector("input[type=text],input[type=url],input[type=email],input[type=number],input[type=password]")
    );
  }

  /** Fill a set of { labelText: value } fields on the profile / login forms. */
  function fill(fields, delay) {
    const out = [];
    for (const [label, value] of Object.entries(fields)) {
      out.push(setValue(field(label), value) ? `ok:${label}` : `MISS:${label}`);
    }
    return delay ? sleep(delay).then(() => out) : out;
  }

  /** Click a button by its exact text (sector, stage, role, batch tabs...). */
  function click(text) {
    return clickText(document, text);
  }

  function blocks() {
    return Array.from(document.querySelectorAll("div.divide-y > div.p-5"));
  }

  function blockFor(text) {
    return blocks().find((b) =>
      (b.querySelector("label")?.textContent || "").includes(text),
    );
  }

  const TEXT_INPUTS = "input[type=text],input[type=url],input[type=email]";

  /** Fill one questionnaire batch from a list of ops. */
  async function fillBatch(ops) {
    const log = [];
    for (const op of ops) {
      const b = blockFor(op.match || op.label);
      if (!b) {
        log.push(`MISS_BLOCK:${op.label}`);
        continue;
      }
      if (op.type === "select") {
        log.push(clickText(b, op.value) ? `ok:${op.label}` : `MISS_OPTION:${op.value}`);
      } else if (op.type === "multiselect") {
        // one click per tick: the component appends to the previous value, so
        // firing them synchronously would drop every option but the last
        for (const v of op.values) {
          if (!clickText(b, v)) log.push(`MISS_OPTION:${v}`);
          await sleep(120);
        }
        if (op.followUp) {
          const ins = Array.from(b.querySelectorAll(TEXT_INPUTS));
          setValue(ins[ins.length - 1], op.followUp);
        }
        log.push(`ok:${op.label}`);
      } else if (op.type === "text" || op.type === "textarea") {
        const el = b.querySelector("textarea") || b.querySelector(TEXT_INPUTS);
        log.push(setValue(el, op.value) ? `ok:${op.label}` : `MISS_FIELD:${op.label}`);
      } else if (op.type === "money") {
        const sels = b.querySelectorAll("select");
        setValue(b.querySelector("input[type=number]"), op.value);
        setValue(sels[0], op.currency);
        setValue(sels[1], op.unit);
        log.push(`ok:${op.label}`);
      } else if (op.type === "repeatable") {
        const rows = () => Array.from(b.querySelectorAll(TEXT_INPUTS));
        let guard = 0;
        while (rows().length / 2 < op.rows.length && guard++ < 8) {
          const add = Array.from(b.querySelectorAll("button")).find((x) =>
            x.textContent.includes("Add another"),
          );
          if (!add) break;
          add.click();
          await sleep(150);
        }
        const ins = rows();
        op.rows.forEach((r, i) => {
          setValue(ins[i * 2], r.name);
          if (ins[i * 2 + 1]) setValue(ins[i * 2 + 1], r.difference);
        });
        log.push(`ok:${op.label} (${op.rows.length} rows)`);
      } else if (op.type === "allocations") {
        const nums = Array.from(b.querySelectorAll("input[type=number]"));
        op.values.forEach((v, i) => setValue(nums[i], v));
        log.push(`ok:${op.label} -> ${op.values.join("/")}`);
      } else {
        log.push(`SKIP:${op.type}`);
      }
      await sleep(op.wait ?? 60);
    }
    return log;
  }

  /** Inject a File into a hidden <input type=file> so the app's real upload runs. */
  async function upload(url, name, mime) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const file = new File([buf], name, { type: mime || "application/pdf" });
    const input = document.querySelector("input[type=file]");
    if (!input) return "no file input";
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return `${name} (${file.size} bytes) injected`;
  }

  window.__vx = { fill, click, fillBatch, blockFor, upload, setValue };
})();

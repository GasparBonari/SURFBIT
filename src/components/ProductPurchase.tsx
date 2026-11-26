"use client";

import { useState, type FormEvent } from "react";
import { defaultSelection, findVariant, formatMoney } from "@/commerce/format";
import type { Product, ProductVariant } from "@/commerce/types";
import { gameEvents } from "@/game/bridge";
import { useCart } from "@/state/cart";
import styles from "./ProductPurchase.module.css";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(() => product.variants.length ? defaultSelection(product) : {});
  const [requested, setRequested] = useState(1);
  const [confirmation, setConfirmation] = useState("");
  const variant = findVariant(product, selected);
  const inCart = useCart((state) => state.lines.find((line) => line.variantId === variant?.id)?.quantity ?? 0);
  const stock = variant?.quantityAvailable ?? 0;
  const remaining = Math.max(0, stock - inCart);
  const quantity = Math.min(requested, remaining);
  const available = product.variants.filter((candidate) => candidate.quantityAvailable > 0);

  const stockLabel = stock === 0 ? "Sold out"
    : remaining === 0 ? "Stock limit reached in your cart"
      : stock <= 3 ? `Only ${stock} left` : "In stock";

  function changeOption(name: string, value: string, candidates: ProductVariant[]) {
    const matching = candidates.filter((candidate) => candidate.selectedOptions[name] === value);
    const preferred = findVariant(product, { ...selected, [name]: value });
    const next = preferred && matching.includes(preferred) ? preferred : matching[0];
    if (!next) return;
    const alreadyAdded = useCart.getState().lines.find((line) => line.variantId === next.id)?.quantity ?? 0;
    setSelected(next.selectedOptions);
    setRequested(Math.max(1, Math.min(quantity, next.quantityAvailable - alreadyAdded)));
    setConfirmation("");
  }

  function adjustQuantity(change: number) {
    const next = quantity + change;
    if (next < 1 || next > remaining) return;
    setRequested(next);
    setConfirmation("");
  }

  function addToCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!variant || quantity === 0) return;

    const cart = useCart.getState();
    const alreadyAdded = cart.lines.find((line) => line.variantId === variant.id)?.quantity ?? 0;
    const added = Math.min(quantity, stock - alreadyAdded);
    if (added <= 0) return;

    cart.add(product, variant, added);
    gameEvents.emit("sound", "add-to-cart");
    setRequested(1);
    setConfirmation(`Added ${added} to cart. ${alreadyAdded + added} in cart for this selection.`);
  }

  return (
    <form className={styles.form} onSubmit={addToCart}>
      <div className={styles.availability}>
        {variant && <strong className={styles.price}>{formatMoney(variant.price)}</strong>}
        <span>{stockLabel}</span>
      </div>

      {product.options.length > 0 && (
        <div className={styles.options}>
          {product.options.map(({ name, values }, index) => {
            // Earlier choices narrow availability. Changing one can select a new valid later choice.
            const prior = product.options.slice(0, index);
            const candidates = available.filter((candidate) =>
              prior.every((option) => candidate.selectedOptions[option.name] === selected[option.name]),
            );
            const stockedValues = new Set(candidates.map((candidate) => candidate.selectedOptions[name]));

            return (
              <label className={styles.option} key={name}>
                {name}
                <select
                  value={selected[name] ?? ""}
                  disabled={candidates.length === 0}
                  onChange={(event) => changeOption(name, event.target.value, candidates)}
                >
                  {values.map((value) => (
                    <option key={value} value={value} disabled={!stockedValues.has(value)}>
                      {value}{stockedValues.has(value) ? "" : " (sold out)"}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}

      <div className={styles.actions}>
        <div className={styles.stepper} role="group" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" aria-disabled={quantity <= 1} onClick={() => adjustQuantity(-1)}>
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Increase quantity" aria-disabled={quantity >= remaining} onClick={() => adjustQuantity(1)}>
            +
          </button>
        </div>
        <button className={`sb-btn ${styles.add}`} type="submit" aria-disabled={quantity === 0}>
          Add to cart
        </button>
      </div>
      <p className={styles.confirmation} role="status">{confirmation}</p>
    </form>
  );
}

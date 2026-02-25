/**
 * Validates a transaction's quantity and batch ID.
 * Returns null if valid, or a string error message if invalid.
 */
export function validateTransaction(qty: number, batchId: string): string | null {
    // 1. Validate Quantity
    if (!Number.isFinite(qty)) {
        return 'Quantity must be a valid number.';
    }

    if (qty === 0) {
        return 'Quantity cannot be zero.';
    }

    if (!Number.isInteger(qty)) {
        return 'Quantity must be a whole number (no decimals).';
    }

    const MAX_QTY = 100000;
    if (Math.abs(qty) > MAX_QTY) {
        return `Quantity exceeds maximum allowed limit of ${MAX_QTY.toLocaleString()}.`;
    }

    // 2. Validate Batch ID
    if (!batchId || batchId.trim() === '') {
        return 'Batch ID is required.';
    }

    if (batchId.length > 50) {
        return 'Batch ID cannot exceed 50 characters.';
    }

    return null;
}

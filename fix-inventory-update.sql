-- Fix for duplicate inventory updates
-- Remove the database trigger that automatically updates inventory
-- since we're handling it in the application webhook

-- Drop the trigger that updates inventory after supplier payment
DROP TRIGGER IF EXISTS trigger_update_inventory_after_supplier_payment ON supplier_order;

-- Drop the function as well since we no longer need it
DROP FUNCTION IF EXISTS update_inventory_after_supplier_payment();

-- Add a comment explaining the change
COMMENT ON TABLE supplier_order IS 'Supplier orders - inventory updates are handled by application webhook, not database triggers';

SELECT 'Database trigger removed successfully! Inventory updates will now only happen via the Stripe webhook.' AS status;

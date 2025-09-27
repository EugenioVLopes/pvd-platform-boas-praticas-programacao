"use client";

import dynamic from "next/dynamic";

import { useSalesProcessing } from "@/hooks/use-sales-processing";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/constants/products";
import { calculateItemTotal } from "@/lib/utils/calculations";

import { CartSection } from "./cart/cart-section";
import { SalesHeader } from "./header/sales-header";
import { ActionSelectionModal } from "./modals/action-selection-modal";
import { PaymentMethodSelection } from "./modals/payment-method-selection";
import { WeightInputModal } from "./modals/weight-input-modal";
import { OrderSection } from "./orders/order-section";
import { CustomizeProductModal } from "./products/customize-product-modal";
import { ProductCategories } from "./products/product-categories";
import { ProductList } from "./products/product-list";

export function SalesProcessing() {
  const {
    state,
    setState,
    products,
    temporaryItems,
    orders,
    calculateOrderTotal,
    handleCategorySelect,
    handleProductSelect,
    handleWeightConfirm,
    handleCustomizeConfirm,
    handlePayment,
    handleActionSelection,
    handleUpdateOrderItem,
    handleRemoveOrderItem,
    handleRemoveFromCart,
    handleUpdateCartItem,
    removeOrder,
  } = useSalesProcessing();

  const getAvailableCategories = () =>
    Array.from(new Set(products.map((p) => p.category))).filter(
      (category): category is ProductCategory =>
        Object.values(PRODUCT_CATEGORIES).includes(category as ProductCategory)
    );

  return (
    <div className="space-y-4">
      <SalesHeader
        showProducts={state.showProducts}
        orders={orders}
        currentOrderId={state.currentOrder?.id}
        onShowProducts={(show) =>
          setState((prev) => ({
            ...prev,
            showProducts: show,
            currentOrder: show ? null : prev.currentOrder,
          }))
        }
        onSelectOrder={(orderId) =>
          setState((prev) => ({
            ...prev,
            currentOrder: orderId
              ? orders.find((o) => o.id === orderId) || null
              : null,
          }))
        }
        onNewOrder={() =>
          setState((prev) => ({ ...prev, isNewOrderModalOpen: true }))
        }
      />

      {state.currentOrder && !state.showProducts && (
        <OrderSection
          order={state.currentOrder}
          onUpdateItem={handleUpdateOrderItem}
          onRemoveItem={handleRemoveOrderItem}
          onFinalize={() =>
            setState((prev) => ({ ...prev, isPaymentModalOpen: true }))
          }
          onDelete={() => {
            const currentOrderId = state.currentOrder?.id;
            if (currentOrderId) {
              removeOrder(currentOrderId);
              setState((prev) => ({ ...prev, currentOrder: null }));
            }
          }}
          calculateOrderTotal={calculateOrderTotal}
        />
      )}

      <main className="min-h-[500px]">
        {!state.showProducts ? (
          <ProductCategories
            categories={getAvailableCategories()}
            selectedCategory={state.selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        ) : (
          <ProductList
            products={products.filter(
              (p) => p.category === state.selectedCategory
            )}
            onProductSelect={handleProductSelect}
          />
        )}

        {temporaryItems.length > 0 && (
          <CartSection
            items={temporaryItems}
            onRemoveItem={handleRemoveFromCart}
            onUpdateItem={handleUpdateCartItem}
            onProceed={() =>
              setState((prev) => ({ ...prev, isActionModalOpen: true }))
            }
            hasOpenOrders={orders.length > 0}
          />
        )}
      </main>

      <WeightInputModal
        isOpen={state.isWeightModalOpen}
        onClose={() =>
          setState((prev) => ({ ...prev, isWeightModalOpen: false }))
        }
        onConfirm={handleWeightConfirm}
        productName={state.selectedProduct?.name || ""}
      />

      <PaymentMethodSelection
        isOpen={state.isPaymentModalOpen}
        onClose={() =>
          setState((prev) => ({ ...prev, isPaymentModalOpen: false }))
        }
        onSelect={handlePayment}
        total={
          state.currentOrder
            ? calculateOrderTotal(state.currentOrder)
            : temporaryItems.reduce(
                (sum, item) => sum + calculateItemTotal(item),
                0
              )
        }
      />

      <ActionSelectionModal
        isOpen={state.isActionModalOpen}
        onClose={() =>
          setState((prev) => ({ ...prev, isActionModalOpen: false }))
        }
        onSelectAction={handleActionSelection}
        orders={orders}
        productName={state.selectedProduct?.name || ""}
      />

      <CustomizeProductModal
        isOpen={state.isCustomizeModalOpen}
        onClose={() =>
          setState((prev) => ({ ...prev, isCustomizeModalOpen: false }))
        }
        product={state.selectedProduct!}
        onConfirm={handleCustomizeConfirm}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(SalesProcessing), { ssr: false });

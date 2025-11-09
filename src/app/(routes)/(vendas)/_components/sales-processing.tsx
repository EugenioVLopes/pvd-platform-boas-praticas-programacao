"use client";

import dynamic from "next/dynamic";

import { useSalesProcessing } from "@/hooks/business/use-sales-processing";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/constants/products";
import { calculateItemTotal } from "@/lib/calculations";

import { CartSection } from "./cart/cart-section";
import { SalesHeader } from "./header/sales-header";
import { ActionSelectionModal } from "./modals/action-selection-modal";
import { NewOrderModal } from "./modals/new-order-modal";
import { PaymentMethodSelection } from "./modals/payment-method-selection";
import { WeightInputModal } from "./modals/weight-input-modal";
import { OrderSection } from "./orders/order-section";
import { CustomizeProductModal } from "./products/customize-product-modal";
import { ProductCategories } from "./products/product-categories";
import { ProductList } from "./products/product-list";

export function SalesProcessing() {
  const {
    uiState,
    uiActions,
    currentOrder,
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
        showProducts={uiState.showProducts}
        orders={orders}
        currentOrderId={currentOrder?.id}
        onShowProducts={(show) => {
          uiActions.setShowProducts(show);
          if (show) {
            uiActions.selectOrder(null);
          }
        }}
        onSelectOrder={(orderId) => uiActions.selectOrder(orderId)}
        onNewOrder={() => uiActions.openNewOrderModal()}
      />

      {currentOrder && !uiState.showProducts && (
        <OrderSection
          order={currentOrder}
          onUpdateItem={handleUpdateOrderItem}
          onRemoveItem={handleRemoveOrderItem}
          onFinalize={() => uiActions.openPaymentModal()}
          onDelete={() => {
            if (currentOrder.id) {
              removeOrder(currentOrder.id);
              uiActions.selectOrder(null);
            }
          }}
          calculateOrderTotal={calculateOrderTotal}
        />
      )}

      <main className="min-h-[500px]">
        {!uiState.showProducts ? (
          <ProductCategories
            categories={getAvailableCategories()}
            selectedCategory={uiState.selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        ) : (
          <ProductList
            products={products.filter(
              (p) => p.category === uiState.selectedCategory
            )}
            onProductSelect={handleProductSelect}
          />
        )}

        {temporaryItems.length > 0 && (
          <CartSection
            items={temporaryItems}
            onRemoveItem={handleRemoveFromCart}
            onUpdateItem={handleUpdateCartItem}
            onProceed={() => uiActions.openActionModal()}
            hasOpenOrders={orders.length > 0}
          />
        )}
      </main>

      <WeightInputModal
        isOpen={uiState.isWeightModalOpen}
        onClose={() => uiActions.closeModal("isWeightModalOpen")}
        onConfirm={handleWeightConfirm}
        productName={uiState.selectedProduct?.name || ""}
      />

      <PaymentMethodSelection
        isOpen={uiState.isPaymentModalOpen}
        onClose={() => uiActions.closeModal("isPaymentModalOpen")}
        onSelect={handlePayment}
        total={
          currentOrder
            ? calculateOrderTotal(currentOrder)
            : temporaryItems.reduce(
                (sum, item) => sum + calculateItemTotal(item),
                0
              )
        }
      />

      <ActionSelectionModal
        isOpen={uiState.isActionModalOpen}
        onClose={() => uiActions.closeModal("isActionModalOpen")}
        onSelectAction={handleActionSelection}
        orders={orders}
        productName={uiState.selectedProduct?.name || ""}
      />

      <CustomizeProductModal
        isOpen={uiState.isCustomizeModalOpen}
        onClose={() => uiActions.closeModal("isCustomizeModalOpen")}
        product={uiState.selectedProduct!}
        onConfirm={handleCustomizeConfirm}
      />

      <NewOrderModal
        isOpen={uiState.isNewOrderModalOpen}
        onClose={() => uiActions.closeModal("isNewOrderModalOpen")}
        onConfirm={(customerName: string) => {
          handleActionSelection("new_order", customerName);
        }}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(SalesProcessing), { ssr: false });

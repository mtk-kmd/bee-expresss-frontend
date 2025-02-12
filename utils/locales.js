export const DELIVERY_STATUS = {
    PROCESSING: 'Processing',
    ORDER_RECEIVED: 'Order Received',
    ITEM_PICKED_UP: 'Item Picked Up',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

export const DELIVERY_STATUS_BADGES = {
    [DELIVERY_STATUS.PROCESSING]: 'bg-info',
    [DELIVERY_STATUS.ORDER_RECEIVED]: 'bg-primary',
    [DELIVERY_STATUS.OUT_FOR_DELIVERY]: 'bg-primary',
    [DELIVERY_STATUS.DELIVERED]: 'bg-success',
    [DELIVERY_STATUS.CANCELLED]: 'bg-danger',
    [DELIVERY_STATUS.ITEM_PICKED_UP]: 'bg-primary',
};

export const LOCALES = {
    VIEW_PACKAGE: 'View Package',
    ACCEPTED_PACKAGES: 'Accepted Packages',
    VIEW_DELIVERY_STATUS: 'View Delivery Status',
}

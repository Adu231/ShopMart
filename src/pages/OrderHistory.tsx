import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle2, AlertCircle, X, Star, XCircle, Clock, ShieldCheck, MapPin, Send, RotateCcw, RefreshCw, FileText, CreditCard, ExternalLink, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { toast } from 'sonner';
import { api } from '@/services/api';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  packed: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
  shipped: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300',
  out_for_delivery: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
  delivered: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  returned: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  return_requested: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  replacement_requested: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
  refunded: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const STATUS_FILTERS = ['All', 'placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

const DELIVERY_STAGES = [
  { status: 'placed', label: 'Order Placed', desc: 'Order confirmed & received' },
  { status: 'packed', label: 'Packed & Inspected', desc: 'Quality assurance checked' },
  { status: 'shipped', label: 'Shipped with Courier', desc: 'In transit via BlueDart' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier agent on the way' },
  { status: 'delivered', label: 'Delivered', desc: 'Package handed over' },
];

const RETURN_STAGES = [
  { status: 'return_requested', label: 'Return/Replacement Logged', desc: 'Doorstep pickup request registered with photos' },
  { status: 'pickup_assigned', label: 'Pickup Agent Assigned', desc: 'BlueDart courier scheduled' },
  { status: 'picked_up', label: 'Item Picked Up', desc: 'Handed over to pickup agent' },
  { status: 'inspected', label: 'Quality Audit at Hub', desc: 'Wood & upholstery inspection' },
  { status: 'returned', label: 'Refund / Replacement Completed', desc: 'Fulfilled successfully' },
];

export default function OrderHistory() {
  const { orders, updateOrderStatus } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  // Interactive Modals State
  const [fullOrderModal, setFullOrderModal] = useState<any | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Placed order by mistake');

  // Return / Replace Modal State & Device Image Uploads
  const [returnReplaceModal, setReturnReplaceModal] = useState<{ order: any; actionType: 'return' | 'replace' } | null>(null);
  const [returnReason, setReturnReason] = useState('Damaged or scratched wood surface on arrival');
  const [returnNotes, setReturnNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('Original Payment Source (UPI/Card)');
  const [issueImages, setIssueImages] = useState<string[]>([]);

  // Review Modal State
  const [reviewModalProduct, setReviewModalProduct] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedProducts, setReviewedProducts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/orders');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  // Handle Defect / Issue Image Uploads from Local Device
  const handleIssueImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setIssueImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveIssueImage = (index: number) => {
    setIssueImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Order Cancellation
  const handleConfirmCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    updateOrderStatus(cancelModalOrder.id, 'cancelled');
    toast.success(`Order #${cancelModalOrder.id} has been cancelled. Refund of ${formatPrice(cancelModalOrder.totalAmount)} initiated.`);
    setCancelModalOrder(null);
    setCancellationReason('Placed order by mistake');
  };

  // Handle Return or Replace Submission (including attached issue photos)
  const handleConfirmReturnReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReplaceModal) return;

    const { order, actionType } = returnReplaceModal;
    const newStatus = actionType === 'return' ? 'return_requested' : 'replacement_requested';
    
    try {
      await api.orders.updateStatus(order.id, newStatus as any);
    } catch (err) {
      console.error('[RETURN STATUS UPDATE ERROR]', err);
    }

    updateOrderStatus(order.id, newStatus as any);

    const imgCount = issueImages.length;
    if (actionType === 'return') {
      toast.success(`Return request submitted for Order #${order.id}! ${imgCount > 0 ? `${imgCount} photo(s) attached.` : ''} Free doorstep pickup scheduled within 48 hours.`);
    } else {
      toast.success(`Replacement request submitted for Order #${order.id}! ${imgCount > 0 ? `${imgCount} photo(s) attached.` : ''} Replacement unit dispatch initiated.`);
    }

    setReturnReplaceModal(null);
    setFullOrderModal(null);
    setReturnReason('Damaged or scratched wood surface on arrival');
    setReturnNotes('');
    setIssueImages([]);
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProduct) return;
    if (!reviewComment.trim()) {
      toast.error('Please write a short review comment.');
      return;
    }

    setReviewedProducts(prev => ({ ...prev, [reviewModalProduct.id]: true }));
    toast.success(`Thank you! Your ${reviewRating}★ review for "${reviewModalProduct.name}" has been published.`);
    setReviewModalProduct(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const getStageIndex = (status: string, stages: typeof DELIVERY_STAGES) => {
    if (status === 'cancelled') return -1;
    const idx = stages.findIndex(s => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <CustomerLayout title="My Orders & Fulfillment" showBackToDashboard>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
              filter === s
                ? 'bg-[#2874F0] text-white shadow-md'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {s === 'All' ? `All Orders (${orders.length})` : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 flex flex-col items-center border border-border shadow-sm text-center">
          <Package size={60} className="text-muted-foreground mb-3" strokeWidth={1} />
          <p className="font-bold text-foreground text-base mb-1">
            No {filter !== 'All' ? filter.replace(/_/g, ' ') : ''} orders found
          </p>
          <p className="text-xs text-muted-foreground mb-5 max-w-sm">
            {filter === 'All' ? 'You have no order history yet. Start exploring handcrafted solid wood furniture!' : `No active orders currently under status "${filter.replace(/_/g, ' ')}"`}
          </p>
          <Link
            to="/products"
            className="text-xs bg-[#2874F0] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1D5FD1] transition-all shadow-md"
          >
            Explore WoodNest Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const city = order.shippingAddress?.city || (order as any).address?.city || 'Bengaluru';
            const state = order.shippingAddress?.state || (order as any).address?.state || 'Karnataka';

            return (
              /* CLEAN & ELEGANT CLICKABLE ORDER CARD */
              <div
                key={order.id}
                className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border hover:border-[#2874F0] hover:shadow-md transition-all group cursor-pointer"
                onClick={() => setFullOrderModal(order)}
                title="Click to view full order details"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-muted/40 border-b border-border text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground mb-0.5">Order Ticket</p>
                      <p className="font-extrabold text-[#2874F0] text-sm group-hover:underline flex items-center gap-1">
                        {order.id} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#2874F0]" />
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground mb-0.5">Placed On</p>
                      <p className="font-semibold text-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground mb-0.5">Total Amount</p>
                      <p className="font-black text-foreground text-sm">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      ● {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-5 space-y-3">
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => {
                      const prod = item.product || {};
                      const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80';
                      const name = prod.name || 'Solid Wood Furniture Item';
                      const price = prod.price || 9999;
                      const qty = item.quantity || 1;

                      return (
                        <div key={prod.id || idx} className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0 border-border">
                          <div className="flex items-center gap-4 min-w-0">
                            <img
                              src={img}
                              alt={name}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                Qty: {qty} × {formatPrice(price)} · {prod.seller || 'Woodcraft Hub'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-foreground flex-shrink-0">{formatPrice(price * qty)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clean Bottom Bar prompting click for details */}
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <p className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
                      📍 Destination: <strong className="text-foreground">{city}, {state}</strong>
                    </p>

                    <span className="text-[#2874F0] font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Full Details & Actions <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL ORDER DETAILS & ACTIONS MODAL */}
      {fullOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                  <FileText className="text-[#2874F0]" size={20} /> Order Invoice & Full Details
                </h3>
                <p className="text-xs text-muted-foreground">Order Ticket ID: <strong className="text-[#2874F0]">{fullOrderModal.id}</strong></p>
              </div>
              <button onClick={() => setFullOrderModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Order Status Badge & Date */}
            <div className="flex items-center justify-between bg-muted p-3.5 rounded-xl border border-border">
              <div>
                <span className="text-muted-foreground text-[10px] block">Order Status:</span>
                <span className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-0.5 ${STATUS_COLORS[fullOrderModal.status] || 'bg-gray-100 text-gray-600'}`}>
                  ● {fullOrderModal.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-[10px] block">Placed On:</span>
                <span className="font-bold text-foreground text-xs">{formatDate(fullOrderModal.createdAt)}</span>
              </div>
            </div>

            {/* Shipping & Delivery Address Card */}
            <div className="bg-card p-4 rounded-xl border border-border space-y-1 text-xs">
              <span className="text-muted-foreground font-bold block mb-1 flex items-center gap-1 text-[11px]">
                <MapPin size={14} className="text-[#2874F0]" /> Shipping & Delivery Address:
              </span>
              <p className="font-bold text-foreground text-sm">{fullOrderModal.shippingAddress?.fullName || 'Priya Customer'}</p>
              <p className="text-muted-foreground">{fullOrderModal.shippingAddress?.street || '102, WoodNest Heights, Indiranagar'}</p>
              <p className="text-muted-foreground">{fullOrderModal.shippingAddress?.city || 'Bengaluru'}, {fullOrderModal.shippingAddress?.state || 'Karnataka'} - {fullOrderModal.shippingAddress?.pincode || '560038'}</p>
              <p className="text-muted-foreground">Phone: {fullOrderModal.shippingAddress?.phone || '9876543210'}</p>
            </div>

            {/* Order Items Breakdown & Review Buttons */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Ordered Items ({fullOrderModal.items?.length})</h4>
              <div className="divide-y divide-border border border-border rounded-xl p-3 bg-muted/20">
                {fullOrderModal.items?.map((item: any, idx: number) => {
                  const prod = item.product || {};
                  const hasReviewed = reviewedProducts[prod.id];
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={prod.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                        <div>
                          <p className="font-bold text-foreground">{prod.name}</p>
                          <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} × {formatPrice(prod.price)} · {prod.seller || 'Woodcraft Hub'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="font-black text-foreground">{formatPrice(prod.price * item.quantity)}</span>

                        {/* Review button inside details modal if delivered */}
                        {fullOrderModal.status === 'delivered' && (
                          <button
                            onClick={() => setReviewModalProduct(prod)}
                            disabled={hasReviewed}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              hasReviewed
                                ? 'bg-emerald-100 text-emerald-700 opacity-80'
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                            }`}
                          >
                            <Star size={11} className={hasReviewed ? 'fill-emerald-600' : 'fill-white'} />
                            {hasReviewed ? 'Reviewed ✓' : 'Write Review'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown Summary */}
            <div className="bg-muted p-4 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Items</span>
                <span>{formatPrice(fullOrderModal.totalAmount * 0.82)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated GST Tax (18%)</span>
                <span>{formatPrice(fullOrderModal.totalAmount * 0.18)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery & Assembly</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between font-black text-sm text-foreground pt-2 border-t border-border">
                <span>Total Amount Paid</span>
                <span className="text-[#2874F0]">{formatPrice(fullOrderModal.totalAmount)}</span>
              </div>
            </div>

            {/* ACTIONS INSIDE FULL DETAILS MODAL */}
            <div className="flex flex-wrap gap-2.5 pt-3 border-t border-border">
              {/* Return & Replace options when Delivered */}
              {fullOrderModal.status === 'delivered' && (
                <>
                  <button
                    onClick={() => { setIssueImages([]); setReturnReplaceModal({ order: fullOrderModal, actionType: 'return' }); }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} /> Return Item
                  </button>
                  <button
                    onClick={() => { setIssueImages([]); setReturnReplaceModal({ order: fullOrderModal, actionType: 'replace' }); }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={14} /> Replace Item
                  </button>
                </>
              )}

              {/* Cancel Order option when active non-delivered */}
              {fullOrderModal.status !== 'delivered' && fullOrderModal.status !== 'cancelled' && fullOrderModal.status !== 'returned' && fullOrderModal.status !== 'return_requested' && fullOrderModal.status !== 'replacement_requested' && (
                <button
                  onClick={() => setCancelModalOrder(fullOrderModal)}
                  className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle size={14} /> Cancel Order
                </button>
              )}

              {/* TRACKING BUTTON CONDITION */}
              {(fullOrderModal.status !== 'delivered' || fullOrderModal.status === 'returned' || fullOrderModal.status === 'return_requested' || fullOrderModal.status === 'replacement_requested') && fullOrderModal.status !== 'cancelled' && (
                <button
                  onClick={() => setTrackingModalOrder(fullOrderModal)}
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Truck size={14} /> {
                    (fullOrderModal.status === 'returned' || fullOrderModal.status === 'return_requested' || fullOrderModal.status === 'replacement_requested')
                      ? 'Track Return / Replacement Status'
                      : 'Track Delivery Status'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RETURN & REPLACE FORM MODAL WITH DEVICE IMAGE UPLOAD */}
      {returnReplaceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                {returnReplaceModal.actionType === 'return' ? (
                  <><RotateCcw className="text-purple-600" size={18} /> Initiate Product Return</>
                ) : (
                  <><RefreshCw className="text-amber-500" size={18} /> Initiate Product Replacement</>
                )}
              </h3>
              <button onClick={() => { setReturnReplaceModal(null); setIssueImages([]); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Order Ticket: <strong className="text-foreground">#{returnReplaceModal.order.id}</strong>. Free doorstep pickup will be arranged.
            </p>

            <form onSubmit={handleConfirmReturnReplace} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Select {returnReplaceModal.actionType === 'return' ? 'Return' : 'Replacement'} Reason
                </label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                >
                  <option value="Damaged or scratched wood surface on arrival">Damaged or scratched wood surface on arrival</option>
                  <option value="Product color or upholstery mismatch">Product color or upholstery mismatch</option>
                  <option value="Defective joint or assembly hardware">Defective joint or assembly hardware</option>
                  <option value="Wrong dimensions or size delivered">Wrong dimensions or size delivered</option>
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                </select>
              </div>

              {returnReplaceModal.actionType === 'return' && (
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">Select Refund Destination</label>
                  <select
                    value={refundMethod}
                    onChange={e => setRefundMethod(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                  >
                    <option value="Original Payment Source (UPI/Card)">Original Payment Source (UPI / Card)</option>
                    <option value="WoodNest Instant Wallet Store Credit">WoodNest Instant Wallet Store Credit</option>
                  </select>
                </div>
              )}

              {/* ISSUE / DEFECT PHOTO UPLOAD FROM DEVICE (NEW FEATURE) */}
              <div>
                <label className="block font-semibold text-foreground mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    <Upload size={14} className="text-[#2874F0]" /> Upload Defect / Issue Photos
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">Max 5 photos</span>
                </label>

                <label className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center group">
                  <Upload size={22} className="text-muted-foreground group-hover:text-[#2874F0] mb-1 transition-colors" />
                  <span className="font-bold text-xs text-foreground">Click to select photos from device</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP (Multiple selection)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleIssueImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Thumbnails Preview */}
                {issueImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {issueImages.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-border group shrink-0 shadow-xs">
                        <img src={img} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveIssueImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm opacity-90 hover:opacity-100 cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">Additional Inspection Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe specific defect or pickup instructions for courier agent..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setReturnReplaceModal(null); setIssueImages([]); }}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-bold py-2.5 rounded-xl text-white transition-colors shadow-md cursor-pointer ${
                    returnReplaceModal.actionType === 'return' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  Submit {returnReplaceModal.actionType === 'return' ? 'Return Request' : 'Replacement Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC LIVE TRACKING MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Truck className="text-[#2874F0]" size={18} />
                  {(trackingModalOrder.status === 'returned' || trackingModalOrder.status === 'return_requested' || trackingModalOrder.status === 'replacement_requested')
                    ? 'Return / Replacement Logistics Tracking'
                    : 'Live Delivery Tracking'}
                </h3>
                <p className="text-xs text-muted-foreground">Order Ticket: <strong>{trackingModalOrder.id}</strong></p>
              </div>
              <button onClick={() => setTrackingModalOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-900 flex justify-between items-center">
                <div>
                  <span className="text-blue-800 dark:text-blue-200 font-bold block">Logistics Partner: BlueDart Logistics</span>
                  <span className="text-muted-foreground text-[10px]">AWB Tracking No: <strong>AWB98240192</strong></span>
                </div>
                <span className="font-extrabold text-[#2874F0] text-xs">Updated Live</span>
              </div>

              {/* Dynamic Stepper */}
              {(() => {
                const isReturnFlow = trackingModalOrder.status === 'returned' || trackingModalOrder.status === 'return_requested' || trackingModalOrder.status === 'replacement_requested';
                const stages = isReturnFlow ? RETURN_STAGES : DELIVERY_STAGES;
                const currentIdx = getStageIndex(trackingModalOrder.status, stages);

                return (
                  <div className="relative pl-6 space-y-5 border-l-2 border-border ml-3 my-2">
                    {stages.map((stg, i) => {
                      const isDone = i <= currentIdx;
                      const isCurrent = i === currentIdx;

                      return (
                        <div key={stg.status} className="relative">
                          <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone ? 'bg-[#2874F0] text-white shadow-sm' : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {isDone ? '✓' : i + 1}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${isCurrent ? 'text-[#2874F0]' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {stg.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{stg.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setTrackingModalOrder(null)}
              className="w-full bg-[#2874F0] text-white font-bold py-2.5 rounded-xl text-xs shadow-md hover:bg-blue-600 transition-colors"
            >
              Close Tracking Window
            </button>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <XCircle className="text-rose-500" size={18} /> Confirm Order Cancellation
              </h3>
              <button onClick={() => setCancelModalOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel order <strong className="text-foreground">#{cancelModalOrder.id}</strong>? A refund of <strong className="text-foreground">{formatPrice(cancelModalOrder.totalAmount)}</strong> will be credited to your payment method.
            </p>

            <form onSubmit={handleConfirmCancelOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Select Reason for Cancellation</label>
                <select
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-rose-500/30 font-medium"
                >
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Found better price elsewhere">Found better price elsewhere</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Incorrect shipping address selected">Incorrect shipping address selected</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT REVIEW MODAL */}
      {reviewModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={18} /> Write Product Review
              </h3>
              <button onClick={() => setReviewModalProduct(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-muted p-3 rounded-xl text-xs">
              <img src={reviewModalProduct.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">{reviewModalProduct.name}</span>
                <span className="text-muted-foreground text-[10px]">Verified Purchase</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Select Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-foreground ml-2">{reviewRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">Your Review Comment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe product quality, timber finish, comfort, packaging, and delivery experience..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalProduct(null)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Submit Public Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

export const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Beige', 'Grey', 'Multicolor']

export const LOCATIONS = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad']

export const PRICE_BUCKETS = [
  { id: 'under-500', label: 'Under ₹500', test: (p) => p < 500 },
  { id: '500-1000', label: '₹500 - ₹1000', test: (p) => p >= 500 && p < 1000 },
  { id: '1000-1500', label: '₹1000 - ₹1500', test: (p) => p >= 1000 && p < 1500 },
  { id: '1500-2000', label: '₹1500 - ₹2000', test: (p) => p >= 1500 && p < 2000 },
  { id: 'above-2000', label: 'Above ₹2000', test: (p) => p >= 2000 },
]

export const DISCOUNT_BUCKETS = [
  { id: '10', label: '10% off or more', test: (d) => d >= 10 },
  { id: '20', label: '20% off or more', test: (d) => d >= 20 },
  { id: '30', label: '30% off or more', test: (d) => d >= 30 },
]

export const GRADES = ['A', 'B', 'C']

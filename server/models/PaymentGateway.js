const mongoose = require("mongoose");

const PaymentGatewaySchema = new mongoose.Schema({
  // Gateway information
  name: {
    type: String,
    required: [true, "Gateway name is required"],
    enum: ["paypal", "stripe", "vodafone_cash", "bank_transfer"]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Configuration
  config: {
    // PayPal configuration
    paypal: {
      clientId: String,
      clientSecret: String,
      mode: {
        type: String,
        enum: ["sandbox", "live"],
        default: "sandbox"
      },
      webhookId: String
    },
    
    // Stripe configuration
    stripe: {
      publishableKey: String,
      secretKey: String,
      webhookSecret: String,
      mode: {
        type: String,
        enum: ["test", "live"],
        default: "test"
      }
    },
    
    // Vodafone Cash configuration
    vodafone_cash: {
      merchantId: String,
      apiKey: String,
      webhookUrl: String
    },
    
    // Bank Transfer configuration
    bank_transfer: {
      bankName: String,
      accountNumber: String,
      accountHolder: String,
      iban: String,
      swiftCode: String
    }
  },
  
  // Transaction fees
  fees: {
    fixed: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  
  // Supported currencies
  supportedCurrencies: [{
    type: String,
    enum: ["USD", "EGP", "EUR"]
  }],
  
  // Gateway status and statistics
  totalTransactions: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  },
  
  // Metadata
  description: String,
  logo: String,
  website: String,
  supportEmail: String,
  supportPhone: String
}, { 
  timestamps: true 
});

// Indexes
PaymentGatewaySchema.index({ name: 1 });
PaymentGatewaySchema.index({ isActive: 1 });

// Virtual for formatted fees
PaymentGatewaySchema.virtual('formattedFees').get(function() {
  if (this.fees.fixed > 0 && this.fees.percentage > 0) {
    return `${this.fees.fixed} + ${this.fees.percentage}%`;
  } else if (this.fees.fixed > 0) {
    return `${this.fees.fixed}`;
  } else if (this.fees.percentage > 0) {
    return `${this.fees.percentage}%`;
  }
  return 'No fees';
});

// Ensure virtuals are included when converting to JSON
PaymentGatewaySchema.set('toJSON', { virtuals: true });
PaymentGatewaySchema.set('toObject', { virtuals: true });

// Static method to get active gateways
PaymentGatewaySchema.statics.getActiveGateways = async function() {
  return await this.find({ isActive: true }).select('-config');
};

// Static method to get gateway configuration
PaymentGatewaySchema.statics.getGatewayConfig = async function(gatewayName) {
  const gateway = await this.findOne({ name: gatewayName, isActive: true });
  return gateway ? gateway.config[gatewayName] : null;
};

module.exports = mongoose.model("PaymentGateway", PaymentGatewaySchema);

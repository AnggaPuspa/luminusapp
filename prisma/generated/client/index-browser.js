
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  avatarUrl: 'avatarUrl',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  password: 'password'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  thumbnailUrl: 'thumbnailUrl',
  originalPrice: 'originalPrice',
  discountedPrice: 'discountedPrice',
  duration: 'duration',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  title: 'title',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  moduleId: 'moduleId',
  title: 'title',
  content: 'content',
  videoUrl: 'videoUrl',
  duration: 'duration',
  sortOrder: 'sortOrder',
  resources: 'resources',
  createdAt: 'createdAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  enrolledAt: 'enrolledAt',
  status: 'status',
  source: 'source',
  certificateUrl: 'certificateUrl'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  amount: 'amount',
  status: 'status',
  paymentMethod: 'paymentMethod',
  paymentChannel: 'paymentChannel',
  mayarInvoiceId: 'mayarInvoiceId',
  mayarInvoiceUrl: 'mayarInvoiceUrl',
  paidAt: 'paidAt',
  expiredAt: 'expiredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  type: 'type',
  couponId: 'couponId',
  discountAmount: 'discountAmount'
};

exports.Prisma.WebhookLogScalarFieldEnum = {
  id: 'id',
  transactionId: 'transactionId',
  event: 'event',
  payload: 'payload',
  httpStatus: 'httpStatus',
  receivedAt: 'receivedAt'
};

exports.Prisma.LessonProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lessonId: 'lessonId',
  completed: 'completed',
  completedAt: 'completedAt',
  createdAt: 'createdAt'
};

exports.Prisma.CourseReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  discountType: 'discountType',
  discountValue: 'discountValue',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  minPurchase: 'minPurchase',
  validFrom: 'validFrom',
  validUntil: 'validUntil',
  isActive: 'isActive',
  courseId: 'courseId',
  createdAt: 'createdAt'
};

exports.Prisma.QuizScalarFieldEnum = {
  id: 'id',
  moduleId: 'moduleId',
  title: 'title'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  quizId: 'quizId',
  questionText: 'questionText',
  options: 'options',
  correctIndex: 'correctIndex',
  sortOrder: 'sortOrder'
};

exports.Prisma.QuizAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  quizId: 'quizId',
  score: 'score',
  totalQ: 'totalQ',
  answers: 'answers',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  tier: 'tier',
  description: 'description',
  monthlyPrice: 'monthlyPrice',
  yearlyPrice: 'yearlyPrice',
  isActive: 'isActive',
  features: 'features',
  allCoursesIncluded: 'allCoursesIncluded',
  communityInviteUrl: 'communityInviteUrl',
  aiMentorQuota: 'aiMentorQuota',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanCourseScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  courseId: 'courseId'
};

exports.Prisma.UserSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  planId: 'planId',
  status: 'status',
  billingCycle: 'billingCycle',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelledAt: 'cancelledAt',
  cancelReason: 'cancelReason',
  aiChatUsedThisMonth: 'aiChatUsedThisMonth',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionInvoiceScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  amount: 'amount',
  status: 'status',
  billingPeriodStart: 'billingPeriodStart',
  billingPeriodEnd: 'billingPeriodEnd',
  mayarInvoiceId: 'mayarInvoiceId',
  mayarInvoiceUrl: 'mayarInvoiceUrl',
  paidAt: 'paidAt',
  failedAt: 'failedAt',
  failureReason: 'failureReason',
  retryCount: 'retryCount',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT'
};

exports.CourseStatus = exports.$Enums.CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

exports.EnrollmentStatus = exports.$Enums.EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  SUSPENDED: 'SUSPENDED'
};

exports.EnrollmentSource = exports.$Enums.EnrollmentSource = {
  PURCHASE: 'PURCHASE',
  SUBSCRIPTION: 'SUBSCRIPTION'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  ONE_TIME: 'ONE_TIME',
  SUBSCRIPTION: 'SUBSCRIPTION'
};

exports.SubscriptionTier = exports.$Enums.SubscriptionTier = {
  BIASA: 'BIASA',
  MURID: 'MURID',
  PROFESIONAL: 'PROFESIONAL'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.BillingCycle = exports.$Enums.BillingCycle = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

exports.SubscriptionInvoiceStatus = exports.$Enums.SubscriptionInvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Course: 'Course',
  Module: 'Module',
  Lesson: 'Lesson',
  Enrollment: 'Enrollment',
  Transaction: 'Transaction',
  WebhookLog: 'WebhookLog',
  LessonProgress: 'LessonProgress',
  CourseReview: 'CourseReview',
  Coupon: 'Coupon',
  Quiz: 'Quiz',
  Question: 'Question',
  QuizAttempt: 'QuizAttempt',
  SubscriptionPlan: 'SubscriptionPlan',
  PlanCourse: 'PlanCourse',
  UserSubscription: 'UserSubscription',
  SubscriptionInvoice: 'SubscriptionInvoice'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"net/http"
	"net/http/httptest"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Middleware", func() {
	var recorder *httptest.ResponseRecorder
	var c *gin.Context

	var voter structs.Voter

	var validAdminJWT string
	var validUserJWT string

	BeforeEach(func() {
		recorder = httptest.NewRecorder()
		c, _ = gin.CreateTestContext(recorder)

		voter = testutils.CreateVoter()
		voter.ID, _ = db.GetDB().CreateVoter(voter)

		validAdminJWT, _ = CreateJWT("admin", time.Minute)
		validUserJWT, _ = CreateJWT(voter.ID.String(), time.Minute)
	})

	AfterEach(func() {
		_ = db.GetDB().DeleteVoter(voter.ID)
	})

	Describe("middleware should correctly validate admins", func() {
		It("blocks invalid logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			c.Request = req
			Middleware(true)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})

		It("allows valid admin logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", validAdminJWT)
			c.Request = req
			Middleware(true)(c)
			Expect(recorder.Code).ToNot(Equal(http.StatusUnauthorized))
		})

		It("blocks valid user logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", validUserJWT)
			c.Request = req
			Middleware(true)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})
	})

	Describe("middleware should correctly validate users", func() {
		It("blocks invalid logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", "invalid-value")
			c.Request = req
			Middleware(false)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})

		It("allows valid user logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", validUserJWT)
			c.Request = req
			Middleware(false)(c)
			Expect(recorder.Code).ToNot(Equal(http.StatusUnauthorized))
		})

		It("blocks valid admin logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", validAdminJWT)
			c.Request = req
			Middleware(false)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})
	})

	It("includes userId in gin context", func() {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("auth", validUserJWT)
		c.Request = req
		Middleware(false)(c)

		userId, exists := c.Get("userId")
		Expect(exists).To(BeTrue())
		Expect(userId).To(Equal(voter.ID.String()))
		Expect(recorder.Code).To(Equal(http.StatusOK))
	})

	When("user is invalidated", func() {
		BeforeEach(func() {
			_ = db.GetDB().InvalidateVoter(voter.ID)
		})

		It("does not return a user id", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("auth", validUserJWT)
			c.Request = req
			Middleware(false)(c)

			userId, exists := c.Get("userId")
			Expect(exists).To(BeFalse())
			Expect(userId).To(BeNil())
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})
	})
})

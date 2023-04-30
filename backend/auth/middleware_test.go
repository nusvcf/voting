package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httptest"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Middleware", func() {
	var recorder *httptest.ResponseRecorder
	var c *gin.Context

	var validAdminJWT string
	var validUserJWT string

	BeforeEach(func() {
		recorder = httptest.NewRecorder()
		c, _ = gin.CreateTestContext(recorder)

		validAdminJWT, _ = CreateJWT("admin", time.Minute)
		validUserJWT, _ = CreateJWT("0001", time.Minute)
	})

	When("middleware should only validate admins", func() {
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

	When("middleware should only validate users", func() {
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
		Expect(userId).To(Equal("0001"))
	})
})

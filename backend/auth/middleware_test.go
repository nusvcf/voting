package auth_test

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
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

		validAdminJWT, _ = auth.CreateJWT("admin", time.Minute)
		validUserJWT, _ = auth.CreateJWT("0001", time.Minute)
	})

	When("middleware should only validate admins", func() {
		It("blocks invalid logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			c.Request = req
			auth.Middleware(true)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})

		It("allows valid admin logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.AddCookie(&http.Cookie{
				Name:  "auth",
				Value: validAdminJWT,
			})
			c.Request = req
			auth.Middleware(true)(c)
			Expect(recorder.Code).ToNot(Equal(http.StatusUnauthorized))
		})

		It("blocks valid user logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.AddCookie(&http.Cookie{
				Name:  "auth",
				Value: validUserJWT,
			})
			c.Request = req
			auth.Middleware(true)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})
	})

	When("middleware should only validate users", func() {
		It("blocks invalid logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.AddCookie(&http.Cookie{
				Name:  "auth",
				Value: "invalid-value",
			})
			c.Request = req
			auth.Middleware(false)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})

		It("allows valid user logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.AddCookie(&http.Cookie{
				Name:  "auth",
				Value: validUserJWT,
			})
			c.Request = req
			auth.Middleware(false)(c)
			Expect(recorder.Code).ToNot(Equal(http.StatusUnauthorized))
		})

		It("blocks valid admin logins", func() {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.AddCookie(&http.Cookie{
				Name:  "auth",
				Value: validAdminJWT,
			})
			c.Request = req
			auth.Middleware(false)(c)
			Expect(recorder.Code).To(Equal(http.StatusUnauthorized))
		})
	})

})

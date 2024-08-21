package emailer

import (
	"gopkg.in/gomail.v2"
	"fmt"
)

// Config holds the configuration for the emailer
type Config struct {
	SMTPHost     string
	SMTPPort     int
	SenderEmail  string
	SenderName   string
	SenderPass   string
}

// Emailer holds the methods to send emails
type Emailer struct {
	config Config
}

// NewEmailer creates a new Emailer with the provided configuration
func NewEmailer(config Config) *Emailer {
	return &Emailer{config: config}
}

// SendConfirmationEmail sends a confirmation email to the given recipient
func (e *Emailer) SendConfirmationEmail(toEmail, toName, confirmationLink string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(e.config.SenderEmail, e.config.SenderName))
	m.SetHeader("To", m.FormatAddress(toEmail, toName))
	m.SetHeader("Subject", "Please confirm your email address")
	m.SetBody("text/html", fmt.Sprintf(`
		<html>
		<body>
		<p>Hello %s,</p>
		<p>Thank you for registering. Please confirm your email address by clicking on the link below:</p>
		<p><a href="%s">Confirm Email Address</a></p>
		<p>If you did not register, please ignore this email.</p>
		</body>
		</html>
	`, toName, confirmationLink))

	d := gomail.NewDialer(e.config.SMTPHost, e.config.SMTPPort, e.config.SenderEmail, e.config.SenderPass)

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

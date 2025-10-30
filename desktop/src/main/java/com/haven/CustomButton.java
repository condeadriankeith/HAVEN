package com.haven;

import javax.swing.*;
import java.awt.*;

public class CustomButton extends JButton {
    private Color bg = new Color(255, 59, 48); // HAVEN Red
    private Color fg = Color.WHITE;
    private boolean isIconButton = false;

    public CustomButton(String text) {
        super(text);
        // Check if this is an icon button (emoji or single character)
        isIconButton = text.length() <= 2;
        
        setFocusPainted(false);
        setContentAreaFilled(false);
        setBorderPainted(false);
        setOpaque(false);
        setForeground(fg);
        
        if (isIconButton) {
            setFont(getFont().deriveFont(Font.PLAIN, 20f));
            setPreferredSize(new Dimension(50, 50));
        } else {
            setFont(getFont().deriveFont(Font.BOLD, 13f));
            setPreferredSize(new Dimension(96, 36));
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        int arc = 18; // Consistent rounded corners for all buttons
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // background with modern flat design
        g2.setColor(bg);
        g2.fillRoundRect(0, 0, getWidth(), getHeight(), arc, arc);

        // label
        FontMetrics fm = g2.getFontMetrics();
        String text = getText();
        int textWidth = fm.stringWidth(text);
        int textX = (getWidth() - textWidth) / 2;
        int textY = (getHeight() + fm.getAscent()) / 2 - 2;
        g2.setColor(fg);
        g2.drawString(text, textX, textY);

        g2.dispose();
    }
}
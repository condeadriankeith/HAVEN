package com.haven;

import javax.swing.*;
import java.awt.*;

public class RoundedPanel extends JPanel {
    private Color backgroundColor = Color.WHITE;
    private int cornerRadius = 18;

    public RoundedPanel() {
        setOpaque(false);
        setBackground(backgroundColor);
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        int w = getWidth();
        int h = getHeight();
        
        // Background with rounded corners
        g2.setColor(backgroundColor);
        g2.fillRoundRect(0, 0, w, h, cornerRadius, cornerRadius);
        
        // Subtle border
        g2.setColor(new Color(200, 200, 200));
        g2.drawRoundRect(0, 0, w-1, h-1, cornerRadius, cornerRadius);
        
        // Soft shadow effect
        g2.setColor(new Color(0, 0, 0, 30));
        g2.fillRoundRect(2, 2, w, h, cornerRadius, cornerRadius);
        
        g2.dispose();
        
        super.paintComponent(g);
    }
}
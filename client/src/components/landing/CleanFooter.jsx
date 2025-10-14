import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  BookOpen, 
  Users,
  Award,
  Shield,
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

const CleanFooter = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const footerLinks = {
    platform: [
      { name: 'الدورات التعليمية', href: '/courses' },
      { name: 'لوحة تحكم ولي الأمر', href: '/parent-demo' },
      { name: 'نظام الألعاب', href: '/gamification' },
      { name: 'الشهادات', href: '/certificates' }
    ],
    support: [
      { name: 'مركز المساعدة', href: '/help' },
      { name: 'تواصل معنا', href: '/contact' },
      { name: 'الأسئلة الشائعة', href: '/faq' },
      { name: 'الدعم الفني', href: '/support' }
    ],
    company: [
      { name: 'من نحن', href: '/about' },
      { name: 'فريق العمل', href: '/team' },
      { name: 'الشراكات', href: '/partners' },
      { name: 'الوظائف', href: '/careers' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-cyan-500' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-500' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'info@ibnmalik.edu', href: 'mailto:info@ibnmalik.edu' },
    { icon: Phone, text: '+20 123 456 7890', href: 'tel:+201234567890' },
    { icon: MapPin, text: 'القاهرة، مصر', href: '#' }
  ];

  return (
    <footer 
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-xl"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">منصة ابن مالك</h3>
                  <p className="text-xs text-gray-400">للتعليم الأزهري</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                منصة تعليمية متطورة تجمع بين التكنولوجيا الحديثة والتربية الأزهرية الأصيلة، 
                لتقديم تجربة تعليمية متميزة لطلاب الأزهر الشريف.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    whileHover={{ x: 5 }}
                  >
                    <contact.icon className="w-4 h-4" />
                    <span>{contact.text}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([section, links], sectionIndex) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + sectionIndex * 0.1 }}
              >
                <h4 className="text-lg font-bold text-white mb-6">
                  {section === 'platform' && 'المنصة'}
                  {section === 'support' && 'الدعم'}
                  {section === 'company' && 'الشركة'}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="border-t border-gray-700 py-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© 2024 منصة ابن مالك. جميع الحقوق محفوظة.</span>
              <Heart className="w-4 h-4 text-red-400" />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:border-gray-600 hover:scale-110`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>آمن ومحمي</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <span>25K+ طالب</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>معتمد</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtle Decorative Elements */}
        <motion.div
          className="absolute bottom-10 left-20 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.5
          }}
        />
      </div>
    </footer>
  );
};

export default CleanFooter;

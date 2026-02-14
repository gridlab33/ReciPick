import { useState, useEffect } from 'react';
import { Settings, Sparkles, BookOpen, MessageCircle, Trash2, Download, Upload, Monitor } from 'lucide-react';

export function SettingsPage({ settings, updateSettings }) {
    const handleDeleteAllData = () => {
        if (window.confirm('정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.removeItem('recipe-scrapbook-data');
            window.location.reload();
        }
    };

    return (
        <div className="page">
            {/* Header */}
            <header className="header">
                <h1 className="header-title">설정</h1>
            </header>

            <div style={{ padding: 'var(--spacing-md)' }}>
                {/* App Info */}
                <section className="category-section">
                    <h2 className="category-section__title">앱 정보</h2>
                    <div className="category-list">
                        <div className="category-item">
                            <span>버전</span>
                            <span className="category-item__count">1.0.0</span>
                        </div>
                        <div className="category-item">
                            <span>개발자</span>
                            <span className="category-item__count" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Gridlab <Monitor size={14} /></span>
                        </div>
                    </div>
                </section>

                {/* YouTube API Settings */}
                <section className="category-section">
                    <h2 className="category-section__title">고급 설정</h2>
                    <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-white)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            YouTube API 키 (선택사항)
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 'var(--spacing-sm)' }}>
                                더 빠른 불러오기
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="AIzaSy... (비워두면 무료 서비스 사용)"
                            value={settings?.youtubeApiKey || ''}
                            onChange={(e) => updateSettings({ youtubeApiKey: e.target.value })}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)', lineHeight: 1.5 }}>
                            💡 YouTube API 키가 없어도 자동 불러오기가 작동합니다. 더 빠르고 안정적인 성능을 원하시면{' '}
                            <a
                                href="https://console.cloud.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                            >
                                Google Cloud Console
                            </a>
                            에서 무료로 발급받으실 수 있습니다.
                        </p>
                    </div>
                </section>

                {/* Data Management */}
                <section className="category-section">
                    <h2 className="category-section__title">데이터 관리</h2>
                    <div className="category-list">
                        <div className="category-item">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Download size={16} /> 데이터 내보내기</span>
                            <span>→</span>
                        </div>
                        <div className="category-item">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Upload size={16} /> 데이터 가져오기</span>
                            <span>→</span>
                        </div>
                        <div
                            className="category-item"
                            style={{ color: '#E74C3C' }}
                            onClick={handleDeleteAllData}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trash2 size={16} /> 모든 데이터 삭제</span>
                            <span>→</span>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section className="category-section">
                    <h2 className="category-section__title">서비스</h2>
                    <div className="category-list">
                        <div className="category-item">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={16} /> 사용 가이드</span>
                            <span>→</span>
                        </div>
                        <div className="category-item">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageCircle size={16} /> 피드백 보내기</span>
                            <span>→</span>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 'var(--spacing-2xl)',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Settings size={16} /> 맛있는 기록
                    </p>
                    <p style={{ marginTop: 'var(--spacing-xs)' }}>
                        SNS에서 발견한 맛있는 레시피를<br />
                        나만의 스크랩북에 저장하세요
                    </p>
                    <p style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Sparkles size={12} /> 무료로 무제한 저장 가능! <Sparkles size={12} />
                    </p>
                </div>
            </div>
        </div>
    );
}
